# lightning-escrow

A basic implementation of a lightning escrow service which allows an escrow service to facilitate payment between two parties. The idea is that the escrow service can never unilaterally run away with the funds because it doesn't custody the payment. Here is a link to read more on the concept: https://thebitcoinmanual.com/articles/ln-escrow/  

Running in VS Code: .vscode/launch.json

```
{
  // Use IntelliSense to learn about possible attributes.
  // Hover to view descriptions of existing attributes.
  // For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Launch Program",
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}\\lightning.js"
    }
  ]
}

```
