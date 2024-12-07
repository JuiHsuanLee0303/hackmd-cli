# HackMD CLI

A command-line interface tool for HackMD, allowing you to manage your notes directly from the terminal.

## Installation

```bash
npm install -g hackmd-cli
```

## Authentication

1. Go to [HackMD Settings](https://hackmd.io/settings#api) and create an API token
2. Run the login command:

```bash
hackmd login
```

## Usage

### Managing Notes

```bash
# Fetch all notes from HackMD and cache them locally
hackmd fetch --all

# List all cached notes
hackmd list

# Fetch a specific note
hackmd fetch <note-id>

# Create a new note
hackmd new -t "Title" -C "Content"
hackmd new  # Interactive mode

# Edit a note
hackmd edit <note-id>
hackmd edit  # Select from cached notes

# Delete a note
hackmd delete <note-id>
hackmd delete  # Select from cached notes

# Export a note
hackmd export <note-id> -f <format> -o <output-path>
hackmd export  # Select from cached notes
```

### Note Creation Options

When creating a new note, you can specify:

- `-t, --title <title>`: Note title
- `-C, --content <content>`: Note content
- `-r, --readPermission <permission>`: Read permission
- `-w, --writePermission <permission>`: Write permission
- `-c, --commentPermission <permission>`: Comment permission

### Export Options

When exporting a note, you can specify:

- `-f, --format <format>`: Export format (md/html/pdf), defaults to md
- `-o, --output <path>`: Output file path

## Features

- **Authentication**: Secure API token management
- **Note Management**: Create, read, update, and delete notes
- **Local Caching**: Cache notes locally for faster access
- **Interactive Mode**: Select notes from a list when no ID is provided
- **Export Options**: Export notes in different formats (Markdown, HTML, PDF)
- **Permission Control**: Set read, write, and comment permissions when creating notes

## Configuration

- Configuration file: `~/.hackmd-cli/config.json`
- API token file: `~/.hackmd-cli/token`
- Notes cache: `~/.hackmd-cli/notes.json`

## Error Handling

- The CLI will guide you through common errors:
  - Missing authentication: Will prompt you to login
  - Invalid token: Will ask for a new token
  - Missing notes cache: Will suggest running `fetch --all`

## License

MIT
