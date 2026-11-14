import { Response } from 'express';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/db.js';
import { StorageService } from '../services/storage/storageService.js';
import { MultimodalProcessor } from '../services/processing/multimodalProcessor.js';
import { detectModality } from '../middleware/upload.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export const FileController = {
  async uploadFiles(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const uploadedFiles = req.files as Express.Multer.File[];

      if (!uploadedFiles || uploadedFiles.length === 0) {
        res.status(400).json({ success: false, message: 'No files were uploaded.' });
        return;
      }

      const createdFiles = [];

      for (const file of uploadedFiles) {
        const ext = path.extname(file.originalname).toLowerCase();
        const modality = detectModality(file.mimetype, file.originalname);

        const storagePath = await StorageService.saveLocalOrRemote(
          file.path,
          file.originalname,
          file.mimetype
        );

        const newRecord = await db.files.create({
          id: uuidv4(),
          user_id: userId,
          original_name: file.originalname,
          storage_path: storagePath,
          mime_type: file.mimetype,
          file_extension: ext,
          file_size: file.size,
          modality,
          processing_status: 'Queued',
          processing_error: null,
        });

        createdFiles.push(newRecord);

        // Asynchronous processing (non-blocking)
        setTimeout(() => {
          MultimodalProcessor.processFile(newRecord.id).catch((err) =>
            console.error(`Async processing failed for ${newRecord.id}:`, err)
          );
        }, 50);
      }

      res.status(201).json({
        success: true,
        message: `Successfully uploaded ${createdFiles.length} file(s). Processing queued.`,
        data: createdFiles,
      });
    } catch (error: any) {
      console.error('File upload error:', error);
      res.status(500).json({ success: false, message: 'Failed to upload files.' });
    }
  },

  async listFiles(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { modality, status, search } = req.query;

      let files = await db.files.find({ user_id: userId });

      if (modality && typeof modality === 'string' && modality !== 'all') {
        files = files.filter((f) => f.modality === modality);
      }
      if (status && typeof status === 'string' && status !== 'all') {
        files = files.filter((f) => f.processing_status === status);
      }
      if (search && typeof search === 'string') {
        const s = search.toLowerCase();
        files = files.filter((f) => f.original_name.toLowerCase().includes(s));
      }

      // Sort newest first
      files.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      res.status(200).json({
        success: true,
        count: files.length,
        data: files,
      });
    } catch (error: any) {
      console.error('List files error:', error);
      res.status(500).json({ success: false, message: 'Failed to retrieve files.' });
    }
  },

  async getFile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const file = await db.files.findById(id);
      if (!file || file.user_id !== userId) {
        res.status(404).json({ success: false, message: 'File not found or permission denied.' });
        return;
      }

      const contents = await db.extractedContents.find({ file_id: id });

      res.status(200).json({
        success: true,
        data: {
          ...file,
          extracted_contents: contents,
        },
      });
    } catch (error: any) {
      console.error('Get file error:', error);
      res.status(500).json({ success: false, message: 'Failed to retrieve file details.' });
    }
  },

  async deleteFile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const file = await db.files.findById(id);
      if (!file || file.user_id !== userId) {
        res.status(404).json({ success: false, message: 'File not found or permission denied.' });
        return;
      }

      await StorageService.deleteFile(file.storage_path);
      await db.files.deleteById(id);
      await db.extractedContents.deleteMany({ file_id: id });

      res.status(200).json({
        success: true,
        message: 'File and associated extractions deleted successfully.',
      });
    } catch (error: any) {
      console.error('Delete file error:', error);
      res.status(500).json({ success: false, message: 'Failed to delete file.' });
    }
  },

  async retryProcessing(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const file = await db.files.findById(id);
      if (!file || file.user_id !== userId) {
        res.status(404).json({ success: false, message: 'File not found.' });
        return;
      }

      // Clear existing extractions
      await db.extractedContents.deleteMany({ file_id: id });

      // Run processor
      MultimodalProcessor.processFile(id);

      res.status(200).json({
        success: true,
        message: 'File processing restarted.',
      });
    } catch (error: any) {
      console.error('Retry processing error:', error);
      res.status(500).json({ success: false, message: 'Failed to reprocess file.' });
    }
  },

  async streamFile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const file = await db.files.findById(id);
      if (!file || file.user_id !== userId) {
        res.status(404).json({ success: false, message: 'File not found.' });
        return;
      }

      if (!fs.existsSync(file.storage_path)) {
        res.status(404).json({ success: false, message: 'Storage file not found on server.' });
        return;
      }

      const stat = fs.statSync(file.storage_path);
      const fileSize = stat.size;
      const range = req.headers.range;

      if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunkSize = end - start + 1;
        const fileStream = fs.createReadStream(file.storage_path, { start, end });

        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize,
          'Content-Type': file.mime_type,
        });
        fileStream.pipe(res);
      } else {
        res.writeHead(200, {
          'Content-Length': fileSize,
          'Content-Type': file.mime_type,
          'Content-Disposition': `inline; filename="${encodeURIComponent(file.original_name)}"`,
        });
        fs.createReadStream(file.storage_path).pipe(res);
      }
    } catch (error: any) {
      console.error('Stream error:', error);
      res.status(500).json({ success: false, message: 'Failed to stream file.' });
    }
  },
};
