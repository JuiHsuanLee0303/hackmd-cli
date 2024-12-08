# HackMD CLI

A command-line interface tool for HackMD that allows you to manage your notes directly from the terminal.

[中文版 README](README_zh_TW.md)

## Installation

### Using npm (Not published yet)

```bash
npm install -g hackmd-cli
```

### Using git

```bash
git clone git@github.com:JuiHsuanLee0303/hackmd-cli.git
cd hackmd-cli
npm install
npm link
```

## Authentication

1. Go to [HackMD Settings](https://hackmd.io/settings#api) and create an API key
2. Run the login command:

```bash
hackmd login
```

## Usage

### Basic Usage

1. List Notes

   - List note titles and IDs

   ```bash
   hackmd list
   ```

   - List detailed note information

   ```bash
   hackmd list -v
   ```

   - Limit the number of notes listed

   ```bash
   hackmd list -l <length>
   ```

   - List specific note fields using parameters
     - `-t` Title
     - `-C` Content
     - `-a` Author
     - `-d` Creation date
     - `-m` Last modified date
     - `-i` ID
     - `-r` Read permission
     - `-w` Write permission

   _If no fields are specified, the title, ID, creation date, and last modified date will be listed._

2. Fetch Notes ( This command will be deprecated in the future. Please use `hackmd list -v` instead. )

   - Fetch a single note

   ```bash
   hackmd fetch <note-id>
   ```

   - Fetch all notes

   ```bash
   hackmd fetch --all
   ```

3. Create Notes

   - Create a note using parameters

   ```bash
   hackmd new -t <Title> -C <Content> -r <readPermission> -w <writePermission> -c <commentPermission>
   ```

   - Create a note in interactive mode

   ```bash
   hackmd new
   ```

   - Create a note from a local file

   ```bash
   hackmd new -f <filename>
   ```

4. Edit Notes

   - Edit a note using parameters

   ```bash
   hackmd edit <note-id> -t <Title> -C <Content> -r <readPermission> -w <writePermission> -c <commentPermission>
   ```

   - Edit a note in interactive mode

   ```bash
   hackmd edit
   ```

   - Edit a note from a local file

   ```bash
   hackmd edit -f <filename>
   ```

5. Delete Notes

   ```bash
   hackmd delete <note-id>
   ```

6. Download Notes

   ```bash
   hackmd download <note-id> -o <output-path>
   ```

   The output-path is optional. If not specified, the note will be downloaded to the current directory.

### Remote Synchronization

Remote synchronization works similar to `git`, allowing you to push local notes to remote or pull remote notes to local.

First, initialize a local HackMD repository:

```bash
hackmd init
```

Then, add a remote note ID to the local repository:

```bash
hackmd remote add <local-name> <note-id>
```

View current remote notes using:

```bash
hackmd remote -v
```

Remove a remote note using:

```bash
hackmd remote remove <local-name>
```

Pull remote notes to local:

```bash
hackmd pull <local-name>
```

If no local name is specified, all remote notes will be pulled.

Push local notes to remote:

```bash
hackmd push <local-name>
```

If no local name is specified, all local notes will be pushed.
