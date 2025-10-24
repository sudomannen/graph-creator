// Graph visualization using vis.js
let network = null;
let nodes = new vis.DataSet([]);
let edges = new vis.DataSet([]);

// Initialize the graph
function initGraph() {
    const container = document.getElementById('graph-canvas');

    const data = {
        nodes: nodes,
        edges: edges
    };

    const options = {
        nodes: {
            shape: 'dot',
            size: 20,
            font: {
                size: 14,
                face: 'Tahoma'
            },
            borderWidth: 2,
            shadow: true
        },
        edges: {
            width: 2,
            shadow: true,
            smooth: {
                type: 'continuous'
            },
            arrows: {
                to: {
                    enabled: true,
                    scaleFactor: 0.5
                }
            },
            font: {
                size: 12,
                align: 'middle'
            }
        },
        physics: {
            forceAtlas2Based: {
                gravitationalConstant: -26,
                centralGravity: 0.005,
                springLength: 230,
                springConstant: 0.18
            },
            maxVelocity: 146,
            solver: 'forceAtlas2Based',
            timestep: 0.35,
            stabilization: {
                enabled: true,
                iterations: 150
            }
        },
        interaction: {
            hover: true,
            tooltipDelay: 200
        }
    };

    network = new vis.Network(container, data, options);

    // Add click event to show node details
    network.on('selectNode', function(params) {
        if (params.nodes.length > 0) {
            const nodeId = params.nodes[0];
            const node = nodes.get(nodeId);
            addLog(`Selected node: ${node.label} (${node.type})`);
        }
    });

    // Add click event to show edge details
    network.on('selectEdge', function(params) {
        if (params.edges.length > 0) {
            const edgeId = params.edges[0];
            const edge = edges.get(edgeId);
            addLog(`Selected edge: ${edge.label || edge.type}`);
        }
    });
}

// Update graph with new data
function updateGraph(graphData) {
    // Define colors for different entity types
    const typeColors = {
        person: '#3498db',
        organization: '#e74c3c',
        location: '#2ecc71',
        concept: '#f39c12',
        unknown: '#95a5a6'
    };

    // Update nodes
    if (graphData.nodes) {
        graphData.nodes.forEach(node => {
            const color = typeColors[node.type] || typeColors.unknown;

            if (!nodes.get(node.id)) {
                nodes.add({
                    id: node.id,
                    label: node.label,
                    title: `${node.label}\nType: ${node.type}`,
                    color: {
                        background: color,
                        border: darkenColor(color, 20),
                        highlight: {
                            background: color,
                            border: darkenColor(color, 40)
                        }
                    },
                    type: node.type
                });
            }
        });
    }

    // Update edges
    if (graphData.edges) {
        graphData.edges.forEach(edge => {
            const edgeId = `${edge.source}-${edge.target}-${edge.type}`;

            if (!edges.get(edgeId)) {
                edges.add({
                    id: edgeId,
                    from: edge.source,
                    to: edge.target,
                    label: edge.label || edge.type,
                    title: edge.label || edge.type,
                    type: edge.type
                });
            }
        });
    }

    updateStats();
}

// Helper function to darken colors
function darkenColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = (num >> 8 & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
        (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
        (B < 255 ? B < 1 ? 0 : B : 255))
        .toString(16).slice(1);
}

// Update statistics
function updateStats() {
    document.getElementById('node-count').textContent = `Nodes: ${nodes.length}`;
    document.getElementById('edge-count').textContent = `Edges: ${edges.length}`;
}

// Add log entry
function addLog(message) {
    const log = document.getElementById('log');
    const timestamp = new Date().toLocaleTimeString();

    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.innerHTML = `
        <span class="timestamp">[${timestamp}]</span>
        <span class="message">${message}</span>
    `;

    log.appendChild(entry);
    log.scrollTop = log.scrollHeight;
}

// Show status message
function showStatus(message, type = 'info') {
    const statusEl = document.getElementById('status-message');
    statusEl.textContent = message;
    statusEl.className = `status-message ${type}`;

    if (type !== 'processing') {
        setTimeout(() => {
            statusEl.textContent = '';
            statusEl.className = 'status-message';
        }, 5000);
    }
}

// Handle file upload
async function uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    try {
        showStatus('Processing file...', 'processing');
        addLog(`Processing file: ${file.name}`);

        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (response.ok && result.success) {
            showStatus(`Successfully processed ${file.name}`, 'success');
            addLog(`Extracted ${result.extracted.entities?.length || 0} entities and ${result.extracted.relationships?.length || 0} relationships`);

            // Update the graph
            updateGraph(result.graph);
        } else {
            throw new Error(result.error || 'Upload failed');
        }
    } catch (error) {
        showStatus(`Error: ${error.message}`, 'error');
        addLog(`Error processing file: ${error.message}`);
        console.error('Upload error:', error);
    }
}

// Reset graph
async function resetGraph() {
    if (!confirm('Are you sure you want to reset the graph?')) {
        return;
    }

    try {
        const response = await fetch('/api/reset', {
            method: 'POST'
        });

        const result = await response.json();

        if (response.ok && result.success) {
            nodes.clear();
            edges.clear();
            updateStats();
            showStatus('Graph reset successfully', 'success');
            addLog('Graph has been reset');
        } else {
            throw new Error('Reset failed');
        }
    } catch (error) {
        showStatus(`Error: ${error.message}`, 'error');
        addLog(`Error resetting graph: ${error.message}`);
        console.error('Reset error:', error);
    }
}

// Load existing graph on page load
async function loadGraph() {
    try {
        const response = await fetch('/api/graph');
        const graphData = await response.json();

        if (graphData.nodes.length > 0 || graphData.edges.length > 0) {
            updateGraph(graphData);
            addLog('Loaded existing graph data');
        }
    } catch (error) {
        console.error('Error loading graph:', error);
    }
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initGraph();
    loadGraph();
    addLog('Application initialized');

    // File input handler
    const fileInput = document.getElementById('file-input');
    const dropZone = document.getElementById('drop-zone');
    const resetBtn = document.getElementById('reset-btn');

    // Click to open file dialog
    dropZone.addEventListener('click', () => {
        fileInput.click();
    });

    // File input change
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            uploadFile(e.target.files[0]);
            e.target.value = ''; // Reset input
        }
    });

    // Drag and drop handlers
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('drag-over');

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            uploadFile(files[0]);
        }
    });

    // Reset button
    resetBtn.addEventListener('click', resetGraph);
});
