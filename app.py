from flask import Flask, render_template, request, jsonify
import os
from dotenv import load_dotenv
from openai import AzureOpenAI
import json

load_dotenv()

app = Flask(__name__)

# Azure OpenAI configuration
client = AzureOpenAI(
    api_key=os.getenv("AZURE_OPENAI_API_KEY"),
    api_version=os.getenv("AZURE_OPENAI_API_VERSION", "2024-02-15-preview"),
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT")
)

# In-memory graph storage (for demo purposes)
graph_data = {
    "nodes": [],
    "edges": []
}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/graph', methods=['GET'])
def get_graph():
    """Get current graph data"""
    return jsonify(graph_data)

@app.route('/api/upload', methods=['POST'])
def upload_file():
    """Handle file upload and extract entities"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400

        # Read file content
        content = file.read().decode('utf-8')

        # Extract entities using Azure OpenAI
        entities_and_relations = extract_entities(content)

        # Update graph data
        update_graph(entities_and_relations)

        return jsonify({
            'success': True,
            'graph': graph_data,
            'extracted': entities_and_relations
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/reset', methods=['POST'])
def reset_graph():
    """Reset the graph to empty state"""
    global graph_data
    graph_data = {"nodes": [], "edges": []}
    return jsonify({'success': True, 'graph': graph_data})

def extract_entities(text):
    """Extract entities and relationships using Azure OpenAI"""
    try:
        system_prompt = """You are an expert at extracting entities and relationships from text.

Extract the following from the provided text:
1. Entities (people, organizations, locations, concepts, etc.)
2. Relationships between entities

Return the result as a JSON object with this structure:
{
    "entities": [
        {"id": "unique_id", "label": "Entity Name", "type": "person|organization|location|concept"}
    ],
    "relationships": [
        {"source": "entity_id", "target": "entity_id", "type": "relationship_type", "label": "relationship description"}
    ]
}

Guidelines:
- Make entity IDs lowercase and use underscores (e.g., "john_doe")
- Be specific about entity types
- Clearly describe relationships
- Only extract entities and relationships that are explicitly mentioned or strongly implied
"""

        response = client.chat.completions.create(
            model=os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME"),
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Extract entities and relationships from this text:\n\n{text}"}
            ],
            temperature=0.3,
            response_format={"type": "json_object"}
        )

        result = json.loads(response.choices[0].message.content)
        return result

    except Exception as e:
        print(f"Error extracting entities: {e}")
        raise

def update_graph(extraction_result):
    """Update the graph with newly extracted entities and relationships"""
    global graph_data

    # Track existing node IDs
    existing_node_ids = {node['id'] for node in graph_data['nodes']}

    # Add new entities as nodes
    if 'entities' in extraction_result:
        for entity in extraction_result['entities']:
            if entity['id'] not in existing_node_ids:
                graph_data['nodes'].append({
                    'id': entity['id'],
                    'label': entity['label'],
                    'type': entity.get('type', 'unknown')
                })
                existing_node_ids.add(entity['id'])

    # Add relationships as edges
    if 'relationships' in extraction_result:
        for rel in extraction_result['relationships']:
            # Check if edge already exists
            edge_exists = any(
                edge['source'] == rel['source'] and
                edge['target'] == rel['target'] and
                edge.get('type') == rel.get('type')
                for edge in graph_data['edges']
            )

            if not edge_exists:
                graph_data['edges'].append({
                    'source': rel['source'],
                    'target': rel['target'],
                    'type': rel.get('type', 'related_to'),
                    'label': rel.get('label', '')
                })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
