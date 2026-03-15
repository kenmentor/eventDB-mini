import promptSync from "prompt-sync"; // Import the sync prompt
import { EvStore } from "./main.ts";

const prompt = promptSync(); // Initialize it

interface ShoppingItem {
  id: string;
  name: string;
  amount: number;
  quantity: number;
  market: string;
}

const database = new EvStore<ShoppingItem>();

// Seed some data

let exit = false;

console.log("--- Welcome to your Event-Sourced Database ---");

while (!exit) {
  // 1. Get input
  const input =  prompt("Enter command (add/update/remove/display/exit): ");
  
  if (!input) continue;

  // 2. Split command from arguments
  const [command, ...args] = input.trim().split(/\s+/);
console.log(`You entered: ${command} with args: ${args.join(", ")}`);
  switch (command.toLowerCase()) {
    case "add":
      // Usage: add Bread 200 2 GroceryStore
      const [name, amountStr, quantityStr, market] = args;
      database.add({ 
        name, 
        amount: parseFloat(amountStr), 
        quantity: parseInt(quantityStr), 
        market 
      });
      console.log(" Item added.");
      console.table(database.getState());

      break;

    case "update":
      // Usage: update ID_HERE amount=500 quantity=10
      const [id, ...updateArgs] = args;
      const updates: any = {};
      updateArgs.forEach(arg => {
        const [key, value] = arg.split("=");
        updates[key] = isNaN(Number(value)) ? value : Number(value);
      });
      database.update(id, updates);
      console.log(" Item updated.");
      console.table(database.getState());
      break;

    case "remove":
      const [removeId] = args;
      database.delete(removeId);
    console.table(database.getState());
      break;

    case "display":
      console.table(database.getState());
      break;

    case "exit":
      console.log(" Exiting...");
      exit = true;
      break;

    default:
      console.log(" Unknown command.");
      console.table(database.getState());
  }
}