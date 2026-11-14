import React, { useState, useEffect, useRef } from 'react';
import {
  Network,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Filter,
  FileText,
  Image as ImageIcon,
  Headphones,
  Video,
  Sparkles,
  Info,
  X,
  Search,
  ExternalLink,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { KnowledgeNode, KnowledgeEdge, FileModality } from '../types';
import FormattedContent from '../components/FormattedContent';

export default function KnowledgeGraphPage() {
  const navigate = useNavigate();
  const [nodes, setNodes] = useState<KnowledgeNode[]>([]);
  const [edges, setEdges] = useState<KnowledgeEdge[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null);
  const [nodeExplanation, setNodeExplanation] = useState<string | null>(null);
  const [explaining, setExplaining] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchGraphData();
  }, []);

  const fetchGraphData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/knowledge-graph');
      const rawNodes: KnowledgeNode[] = res.data.nodes || [];
      const rawEdges: KnowledgeEdge[] = res.data.edges || [];

      // Calculate initial layout coordinates in circular/clustered orbits
      const width = 800;
      const height = 550;
      const centerX = width / 2;
      const centerY = height / 2;

      const positionedNodes = rawNodes.map((node, index) => {
        const angle = (index / (rawNodes.length || 1)) * 2 * Math.PI;
        const radius = 160 + (index % 3) * 60;
        return {
          ...node,
          x: centerX + radius * Math.cos(angle) + (Math.random() * 20 - 10),
          y: centerY + radius * Math.sin(angle) + (Math.random() * 20 - 10),
        };
      });

      setNodes(positionedNodes);
      setEdges(rawEdges);
    } catch (err) {
      console.error('Failed to load knowledge graph', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNodeClick = async (node: KnowledgeNode) => {
    setSelectedNode(node);
    setNodeExplanation(null);
    setExplaining(true);
    try {
      const res = await api.post('/knowledge-graph/explain-node', {
        conceptLabel: node.label,
        fileIds: node.file_ids,
      });
      setNodeExplanation(res.data.explanation);
    } catch (err) {
      setNodeExplanation(node.description || 'No detailed explanation available.');
    } finally {
      setExplaining(false);
    }
  };

  const filteredNodes = nodes.filter((n) => {
    const matchesFilter = activeFilter === 'all' || n.modality === activeFilter;
    const matchesSearch =
      !searchQuery ||
      n.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getModalityColor = (mod: FileModality) => {
    switch (mod) {
      case 'document':
      case 'text':
        return '#3b82f6'; // blue
      case 'image':
        return '#10b981'; // emerald
      case 'audio':
        return '#f59e0b'; // amber
      case 'video':
        return '#ef4444'; // red
      default:
        return '#8b5cf6'; // violet
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 text-brand-violet text-xs font-bold uppercase tracking-wider mb-2">
            <Network className="w-4 h-4" />
            Interactive Concept Map
          </div>
          <h1 className="text-3xl font-extrabold text-navy-900 tracking-tight">
            AI Knowledge Graph
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-3xl">
            Visual topological representation of entities, formulas, theories, and cross-source linkages extracted across your entire multimodal library.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom((z) => Math.min(z + 0.2, 2.5))}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(z - 0.2, 0.5))}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setZoom(1);
              setOffset({ x: 0, y: 0 });
            }}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm"
            title="Reset View"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            onClick={fetchGraphData}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm"
            title="Refresh Graph"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        {/* Modality Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Modality:
          </span>
          {['all', 'document', 'image', 'audio', 'video'].map((mod) => (
            <button
              key={mod}
              onClick={() => setActiveFilter(mod)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${
                activeFilter === mod
                  ? 'bg-navy-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {mod}
            </button>
          ))}
        </div>

        {/* Concept Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search concepts or formulas..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-navy-900"
          />
        </div>
      </div>

      {/* Main Canvas and Inspector Split */}
      <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SVG Interactive Canvas */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="lg:col-span-2 h-[600px] bg-slate-900 rounded-3xl border border-slate-800 relative overflow-hidden cursor-grab active:cursor-grabbing select-none shadow-inner"
        >
          {loading ? (
            <div className="h-full flex items-center justify-center flex-col gap-3 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-brand-violet" />
              <span className="text-xs font-semibold tracking-wider uppercase">
                Mapping Multimodal Topology...
              </span>
            </div>
          ) : nodes.length === 0 ? (
            <div className="h-full flex items-center justify-center flex-col gap-2 text-slate-400 p-8 text-center">
              <Network className="w-12 h-12 text-slate-600" />
              <p className="text-sm font-semibold text-slate-300">No Knowledge Nodes Detected Yet</p>
              <p className="text-xs text-slate-500 max-w-sm">
                Upload course documents, handwritten notes, or lecture recordings to automatically generate your interactive concept graph.
              </p>
            </div>
          ) : (
            <svg
              className="w-full h-full"
              viewBox="0 0 800 600"
              style={{
                transform: `scale(${zoom}) translate(${offset.x / zoom}px, ${offset.y / zoom}px)`,
                transformOrigin: 'center center',
                transition: isDragging ? 'none' : 'transform 0.15s ease-out',
              }}
            >
              {/* Grid Background */}
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Connecting Edges */}
              {edges.map((edge, idx) => {
                const source = nodes.find((n) => n.id === edge.source_id);
                const target = nodes.find((n) => n.id === edge.target_id);
                if (!source || !target || !source.x || !source.y || !target.x || !target.y)
                  return null;

                const isConnectedToSelected =
                  selectedNode &&
                  (selectedNode.id === source.id || selectedNode.id === target.id);

                return (
                  <g key={idx}>
                    <line
                      x1={source.x}
                      y1={source.y}
                      x2={target.x}
                      y2={target.y}
                      stroke={isConnectedToSelected ? '#a855f7' : '#334155'}
                      strokeWidth={isConnectedToSelected ? 2.5 : 1.2}
                      strokeDasharray={edge.relation_type === 'contradicts' ? '4,4' : undefined}
                      opacity={isConnectedToSelected ? 0.9 : 0.4}
                    />
                    {edge.label && (
                      <text
                        x={(source.x + target.x) / 2}
                        y={(source.y + target.y) / 2 - 4}
                        fill="#94a3b8"
                        fontSize="9"
                        textAnchor="middle"
                        fontFamily="monospace"
                      >
                        {edge.label}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Nodes */}
              {filteredNodes.map((node) => {
                if (!node.x || !node.y) return null;
                const isSelected = selectedNode?.id === node.id;
                const nodeColor = getModalityColor(node.modality);

                return (
                  <g
                    key={node.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNodeClick(node);
                    }}
                    className="cursor-pointer transition-transform hover:scale-110"
                    transform={`translate(${node.x}, ${node.y})`}
                  >
                    {/* Pulsing ring if selected */}
                    {isSelected && (
                      <circle
                        r="24"
                        fill="none"
                        stroke="#a855f7"
                        strokeWidth="2"
                        className="animate-ping opacity-75"
                      />
                    )}

                    {/* Node Core */}
                    <circle
                      r={isSelected ? 18 : 14}
                      fill={nodeColor}
                      stroke="#0f172a"
                      strokeWidth="3"
                      className="shadow-md"
                    />

                    {/* Category icon or indicator */}
                    <circle r="4" fill="#ffffff" opacity="0.9" />

                    {/* Label */}
                    <text
                      y={isSelected ? 32 : 28}
                      fill={isSelected ? '#ffffff' : '#cbd5e1'}
                      fontSize={isSelected ? '12' : '10'}
                      fontWeight={isSelected ? 'bold' : 'normal'}
                      textAnchor="middle"
                      className="pointer-events-none drop-shadow"
                    >
                      {node.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          )}

          {/* Quick HUD legend on bottom-left */}
          <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-md border border-slate-800 p-2.5 rounded-xl flex items-center gap-3 text-[11px] text-slate-300 pointer-events-none">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span> Document
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Image/Diagram
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span> Audio
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span> Video
            </span>
          </div>
        </div>

        {/* Node Detail Inspector Drawer */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between h-[600px] overflow-y-auto">
          {selectedNode ? (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Concept Inspector
                </span>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getModalityColor(selectedNode.modality) }}
                  ></span>
                  <span className="text-xs uppercase font-bold text-slate-500">
                    {selectedNode.category}
                  </span>
                </div>
                <h2 className="text-xl font-extrabold text-navy-900">{selectedNode.label}</h2>
              </div>

              {/* Confidence & Modality badge */}
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium capitalize">
                  Modality: {selectedNode.modality}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-violet-50 text-brand-violet text-xs font-semibold">
                  {Math.round(selectedNode.confidence * 100)}% Confidence
                </span>
              </div>

              {/* AI Explanation */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-navy-900 uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-brand-violet" />
                  AI Synthesis & Grounded Definition
                </div>
                {explaining ? (
                  <div className="py-6 flex items-center justify-center gap-2 text-xs text-slate-400">
                    <Loader2 className="w-4 h-4 animate-spin text-brand-violet" />
                    <span>Synthesizing cross-source context...</span>
                  </div>
                ) : (
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed max-h-[180px] overflow-y-auto">
                    <FormattedContent content={nodeExplanation || selectedNode.description} />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
                <button
                  onClick={() =>
                    navigate(`/chat?query=Explain%20how%20${encodeURIComponent(selectedNode.label)}%20is%20used%20in%20my%20uploaded%20files`)
                  }
                  className="w-full py-2.5 px-4 bg-navy-900 hover:bg-navy-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition"
                >
                  <Sparkles className="w-4 h-4 text-brand-violet" />
                  Ask AI About This Concept
                </button>
                <button
                  onClick={() =>
                    navigate(`/detective?query=Cross-examine%20evidence%20for%20${encodeURIComponent(selectedNode.label)}`)
                  }
                  className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition"
                >
                  <Search className="w-4 h-4" />
                  Forensically Investigate
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-3">
              <Info className="w-8 h-8 text-slate-300" />
              <div className="text-sm font-semibold text-slate-600">Select Any Node</div>
              <p className="text-xs text-slate-400">
                Click any concept or formula bubble on the graph to inspect its AI explanation, cross-modal references, and supporting files.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
