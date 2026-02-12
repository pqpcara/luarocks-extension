# LuaRocks Support

A VS Code extension that provides comprehensive support for Lua Rocks development.

## Features

### Syntax Highlighting
- Full syntax highlighting for `.rockspec` files
- Color-coded keywords, strings, numbers, and comments
- Proper indentation support

### Auto-Complete
- Intelligent auto-completion for all rockspec fields
- Suggestions for:
  - `package` - Package name
  - `version` - Package version
  - `description` - Package description
  - `author` - Package author
  - `license` - License type
  - `url` - Repository URL
  - `dependencies` - Package dependencies
  - `build` - Build configuration
  - And more...

### Init Command
- Interactive command to create new rockspec files
- Guided setup with validation:
  - Package name validation
  - Semantic versioning validation
  - License selection
  - Repository URL input
- Auto-generates complete rockspec structure

## Installation

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "LuaRocks Support"
4. Click Install

## Usage

### Create a New Rockspec

1. Open the Command Palette (Ctrl+Shift+P)
2. Type "LuaRocks: Init New Package"
3. Answer the interactive prompts:
   - Package name (lowercase, numbers, hyphens, underscores)
   - Initial version (semantic versioning)
   - Description
   - Author name
   - License (MIT, Apache 2.0, GPL 3.0, BSD, ISC, or custom)
   - Repository URL (optional)

The extension will create a `.rockspec` file with the proper structure.

### Edit Rockspec Files

1. Open any `.rockspec` file
2. Start typing a field name
3. Press Ctrl+Space to see auto-complete suggestions
4. Select the desired field
5. The field name and `=` will be inserted automatically

## Example Rockspec

```rockspec
rockspec_format = "3.0"
package = "my-awesome-lib"
version = "0.1.0"
description = {
   summary = "A brief description",
   detailed = "A detailed description",
   homepage = "https://github.com/user/my-awesome-lib",
   license = "MIT"
}
author = "Your Name"
maintainer = "Your Name"
url = "https://github.com/user/my-awesome-lib"
issues_url = "https://github.com/user/my-awesome-lib/issues"
labels = { "lua", "rocks" }

dependencies = {
   "lua >= 5.1"
}

build = {
   type = "builtin",
   modules = {
      my_awesome_lib = "src/my_awesome_lib.lua"
   }
}
```

## Supported Fields

- `rockspec_format` - Rockspec format version
- `package` - Package name
- `version` - Package version
- `description` - Package description (table with summary, detailed, homepage, license)
- `author` - Package author
- `maintainer` - Package maintainer
- `url` - Repository URL
- `issues_url` - Issues tracker URL
- `labels` - Package labels/tags
- `dependencies` - Lua dependencies
- `build` - Build configuration
- `type` - Build type (builtin, cmake, make, etc)
- `modules` - Lua modules
- `copy_directories` - Directories to copy

## License

MIT

## Contributing

Contributions are welcome! Feel free to submit issues and pull requests.

## Support

For issues, questions, or suggestions, please open an issue on the GitHub repository.

## Links

[Github](https://github.com/pqpcara/luarocks-extension)
[Issues](https://github.com/pqpcara/luarocks-extension/issues)