# Graph Creator - Entity Extraction and Visualization

A Flask-based web application that uses Azure OpenAI to extract entities and relationships from text files and visualizes them as an interactive knowledge graph.

## Features

- **Drag & Drop Interface**: Easy file upload by dragging text files into the browser
- **AI-Powered Entity Extraction**: Uses Azure OpenAI to automatically extract entities and relationships
- **Interactive Graph Visualization**: Real-time graph visualization using vis.js
- **Iterative Graph Building**: Add multiple files to continuously build and expand your knowledge graph
- **Entity Type Detection**: Automatically categorizes entities (people, organizations, locations, concepts)
- **Relationship Mapping**: Visualizes connections between entities with labeled edges

## Prerequisites

- Python 3.8 or higher
- Azure OpenAI Service account with an active deployment

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd graph-creator
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your Azure OpenAI credentials:
```
AZURE_OPENAI_API_KEY=your_api_key_here
AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT_NAME=your_deployment_name
AZURE_OPENAI_API_VERSION=2024-02-15-preview
```

## Usage

1. Start the Flask application:
```bash
python app.py
```

2. Open your browser and navigate to:
```
http://localhost:5000
```

3. Drag and drop text files into the upload area or click to browse

4. Watch as entities and relationships are extracted and visualized in real-time

5. Click on nodes and edges to see detailed information

6. Use the "Reset Graph" button to clear the graph and start fresh

## How It Works

1. **File Upload**: User drops a text file into the browser
2. **Content Extraction**: Flask backend reads the file content
3. **AI Processing**: Azure OpenAI analyzes the text and extracts:
   - Entities (people, organizations, locations, concepts)
   - Relationships between entities
4. **Graph Construction**: Entities become nodes, relationships become edges
5. **Visualization**: The graph is rendered using vis.js with physics simulation
6. **Iterative Building**: Each new file adds to the existing graph

## Entity Types

The system recognizes and color-codes the following entity types:

- **Person** (Blue): Individuals mentioned in the text
- **Organization** (Red): Companies, institutions, groups
- **Location** (Green): Places, cities, countries
- **Concept** (Orange): Abstract ideas, technologies, methodologies
- **Unknown** (Gray): Entities that don't fit other categories

## API Endpoints

- `GET /`: Main application interface
- `GET /api/graph`: Get current graph data
- `POST /api/upload`: Upload and process a file
- `POST /api/reset`: Reset the graph to empty state

## Project Structure

```
graph-creator/
├── app.py                 # Flask application and API routes
├── requirements.txt       # Python dependencies
├── .env.example          # Environment variables template
├── templates/
│   └── index.html        # Main HTML page
├── static/
│   ├── css/
│   │   └── style.css     # Styles and layout
│   └── js/
│       └── app.js        # Frontend logic and graph visualization
```

## Technologies Used

- **Backend**: Flask, Azure OpenAI SDK
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Visualization**: vis.js network library
- **AI**: Azure OpenAI GPT models

## Configuration

### Azure OpenAI Setup

1. Create an Azure OpenAI resource in the Azure Portal
2. Deploy a GPT model (GPT-3.5-turbo or GPT-4)
3. Copy the endpoint, API key, and deployment name
4. Add these to your `.env` file

### Customizing Entity Extraction

You can modify the entity extraction prompt in `app.py` (line 56) to:
- Add more entity types
- Change relationship detection rules
- Adjust extraction granularity

## Troubleshooting

**Graph not displaying:**
- Check browser console for JavaScript errors
- Ensure vis.js library is loading correctly

**Entity extraction failing:**
- Verify Azure OpenAI credentials in `.env`
- Check that your deployment name is correct
- Ensure your API key has proper permissions

**Files not uploading:**
- Verify file is plain text (.txt or .md)
- Check file size (very large files may timeout)
- Look at Flask console for error messages

## Future Enhancements

- Support for PDF and DOCX files
- Graph persistence (database storage)
- Export graph as JSON/GraphML
- Advanced filtering and search
- Multiple graph management
- Collaborative editing

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
