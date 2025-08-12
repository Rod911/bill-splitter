# Food Bill Splitter - User Guide

A web app for splitting food bills fairly among multiple people with support for shared items, tax calculations, and detailed payment breakdowns.

## Features

- **Manual Bill Entry**: Add items one by one with quantities and prices
- **Bill Parsing**: Paste entire bills and automatically extract items
- **Member Management**: Add multiple members easily
- **Flexible Sharing**: Assign decimal quantities to members (0.5 for half portions, 2 for double portions)
- **Tax Calculation**: Automatic tax distribution across all members
- **Round-off Support**: Optional bill rounding with proportional distribution
- **Order Summary**: Detailed breakdown of what each person ordered
- **Auto-save**: All data saves automatically and restores on page refresh

## Getting Started

### 1. Adding Bill Items

**Manual Entry:**
1. Enter item name in the "Item name" field
2. Set unit price and quantity
3. Item total calculates automatically
4. Click "Add Item" to add more items

**Paste Bill (Recommended):**
1. Click "Paste Bill" button
2. Paste your bill text in supported formats:
   - `Coffee 10 20.00 200.00` (name, quantity, unit price, total)
   - `Tea 2 x 25.50 = 51.00` (name, qty x price = total)
   - `Coke 2 @ 25.50 = 51.00` (name, qty @ price = total)
3. Click "Parse Bill" to automatically extract all items

**Tax Setup:**
- Enter tax percentage in the tax field (e.g., 18 for 18% GST)
- Tax is automatically calculated and distributed proportionally

**Round-off Option:**
- Check "Round off total" to round the final bill amount
- Round-off difference is distributed proportionally among members

### 2. Adding Members

**Single Member:**
- Type name in the input field and press Enter or click "Add"

**Multiple Members (Bulk Add):**
- Paste comma-separated: `Alice, Bob, Charlie, David`
- Paste tab-separated (from Excel/Sheets)
- Paste line-separated (one name per line)
- Mix of separators is supported

**Managing Members:**
- Click the red × button next to any member to remove them
- Removing a member removes all their assignments

### 3. Assigning Items to Members

For each item:

1. **Select Members**: Click member buttons to select who ordered this item
   - Blue = selected, Gray = not selected
   - Member selection is hidden once the item is fully assigned

2. **Set Quantities**: For selected members, set their quantities
   - **Default**: Each selected member gets quantity 1.0
   - **Decimal Support**: Use 0.5 for half portions, 2.0 for double portions
   - **+/- Buttons**: Quick increment/decrement by 1
   - **Manual Input**: Type precise decimal values (1 decimal place)

3. **Auto-removal**: When quantity reaches 0, the member is automatically removed from that item

### 4. Understanding the Results

**Validation Indicators:**
- ✅ Green checkmark: Item quantities match assigned quantities
- ❌ Red alert: Assigned quantities don't match item quantity

**Payment Summary:**
Each member's card shows:
- **Order Details**: List of assigned items with quantities
- **Tax Breakdown**: Their share of tax
- **Round-off**: Their share of round-off (if enabled)
- **Total Amount**: Final amount to pay

**Verification:**
- Bottom section shows total assigned vs grand total
- Both amounts should match when all items are properly assigned

## Usage Examples

### Example 1: Simple Equal Split
**Bill**: Pizza ₹400 (quantity: 1)
**Members**: Alice, Bob
**Assignment**: Alice = 0.5, Bob = 0.5
**Result**: Each pays ₹200 + tax

### Example 2: Different Quantities
**Bill**: Burger ₹150 (quantity: 3)
**Members**: Alice, Bob, Charlie
**Assignment**: Alice = 1, Bob = 2, Charlie = 0 (doesn't want burger)
**Result**: Alice pays ₹50, Bob pays ₹100, Charlie pays ₹0

### Example 3: Mixed Items
**Bill**: 
- Pizza ₹400 (qty: 1)
- Drinks ₹60 (qty: 2)

**Members**: Alice, Bob
**Assignment**: 
- Pizza: Alice = 0.5, Bob = 0.5
- Drinks: Alice = 1, Bob = 1
**Result**: Alice pays ₹230, Bob pays ₹230

## Pro Tips

1. **Quick Setup**: Use the bill paste feature for fastest item entry
2. **Bulk Members**: Copy member names from WhatsApp groups or contact lists
3. **Shared Items**: Use 0.5 quantities when two people share one item
4. **Multiple Portions**: Use quantities > 1 when someone orders multiple units
5. **Tax Inclusive**: The app handles tax distribution automatically
6. **Auto-save**: Your work is automatically saved, safe to refresh or close
7. **Mobile Friendly**: Works perfectly on phones with horizontal scrolling for large bills

## Keyboard Shortcuts

- **Enter**: Add member or parse bill
- **Tab**: Navigate between fields
- **+/-**: Use on-screen buttons for quick quantity adjustments

## Data Persistence

All your data (items, members, assignments, settings) is automatically saved to your browser's local storage and restored when you return to the app.

## Supported Bill Formats

When pasting bills, the app recognizes these formats:
- `Item Name 5 25.50 127.50` (quantity, unit price, total)
- `Item Name 5 x 25.50 = 127.50`
- `Item Name 5 @ 25.50 = 127.50`
- Lines containing `tax 18%` or similar for automatic tax detection

## Troubleshooting

**Items not parsing correctly?**
- Ensure format matches supported patterns
- Check for proper spacing between numbers
- Verify quantity × price = total in your bill

**Assignment not adding up?**
- Check the red/green indicators on each item
- Ensure assigned quantities match item quantities exactly
- Use decimal quantities for partial assignments

**Members not appearing in order?**
- Assignment sections show members in the same order as the Members list
- Rearrange by removing and re-adding members if needed

---

*The Food Bill Splitter makes group dining expenses fair and transparent for everyone involved.*