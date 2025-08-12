import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Users,
  Calculator,
  Upload,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import "./App.css";

type Item = {
  id: number;
  name: string;
  unitPrice: number;
  quantity: number;
  total: number;
};

type Assignment = {
  [key: string]: { [key: string]: number };
};

type SelectedMembers = {
    [key: string]: string[];
  }

const saved = localStorage.getItem("billSplitterData");
const data = JSON.parse(saved!);

const BillSplitter = () => {
  const [items, setItems] = useState<Item[]>(
    data?.items ?? [{ id: 1, name: "", unitPrice: 0, quantity: 1, total: 0 }]
  );
  const [taxRate, setTaxRate] = useState<number>(data?.taxRate ?? 0);
  const [members, setMembers] = useState<string[]>(data?.members ?? []);
  const [assignments, setAssignments] = useState<Assignment>(
    data?.assignments ?? {}
  );
  const [selectedMembers, setSelectedMembers] = useState<SelectedMembers>(data?.selectedMembers??{});
  const [roundOffTotal, setRoundOffTotal] = useState<boolean>(data?.roundOffTotal ?? false);

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      if (typeof Storage !== "undefined" && localStorage) {
        const data = {
          items,
          taxRate,
          members,
          assignments,
          selectedMembers,
          roundOffTotal,
        };
        localStorage.setItem("billSplitterData", JSON.stringify(data));
      }
    } catch (error) {
      console.warn("Failed to save to localStorage:", error);
    }
  }, [items, taxRate, members, assignments, selectedMembers, roundOffTotal]);
  const [billText, setBillText] = useState("");
  const [showPasteMode, setShowPasteMode] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");

  // Calculate item totals
  useEffect(() => {
    const updatedItems = items.map((item) => ({
      ...item,
      total: item.unitPrice * item.quantity,
    }));
    setItems(updatedItems);
  }, []);

  const updateItem = (id: number, field: string, value: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]:
                field === "unitPrice" || field === "quantity"
                  ? parseFloat(value) || 0
                  : value,
            }
          : item
      )
    );
  };

  const addItem = () => {
    const newId = Math.max(...items.map((i) => i.id), 0) + 1;
    setItems((prev) => [
      ...prev,
      { id: newId, name: "", unitPrice: 0, quantity: 1, total: 0 },
    ]);
  };

  const removeItem = (id: number) => {
    if (items.length > 1) {
      setItems((prev) => prev.filter((item) => item.id !== id));
      setAssignments((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
      setSelectedMembers((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
    }
  };

  const addMember = () => {
    if (newMemberName.trim() && !members.includes(newMemberName.trim())) {
      setMembers((prev) => [...prev, newMemberName.trim()]);
      setNewMemberName("");
    }
  };

  const addMultipleMembers = (text: string) => {
    const separators = [",", "\t", "\n"];
    let memberNames = [text];

    // Split by all possible separators
    separators.forEach((separator) => {
      memberNames = memberNames.flatMap((name) =>
        name
          .split(separator)
          .map((n: string) => n.trim())
          .filter((n: any) => n)
      );
    });

    // Add unique members
    const newMembers = memberNames.filter(
      (name) => name && !members.includes(name)
    );

    if (newMembers.length > 0) {
      setMembers((prev) => [...prev, ...newMembers]);
      setNewMemberName("");
    }
  };

  const removeMember = (name: string) => {
    setMembers((prev) => prev.filter((m) => m !== name));
    setAssignments((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((itemId) => {
        if (updated[itemId] && updated[itemId][name]) {
          delete updated[itemId][name];
        }
      });
      return updated;
    });
    setSelectedMembers((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((itemId) => {
        if (updated[itemId]) {
          updated[itemId] = updated[itemId].filter(
            (member: any) => member !== name
          );
        }
      });
      return updated;
    });
  };

  const updateAssignment = (
    itemId: number,
    member: string,
    quantity: string | number
  ) => {
    const roundedQty = Math.round(parseFloat(quantity as string) * 100) / 100; // Round to 2 decimal place
    setAssignments((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [member]: isNaN(roundedQty) ? 0 : roundedQty,
      },
    }));
  };

  const adjustQuantity = (itemId: number, member: string, delta: number) => {
    const current = assignments[itemId]?.[member] || 0;
    const newQty = Math.max(0, Math.round((current + delta) * 10) / 10);

    if (newQty === 0) {
      // Remove member from assignments and selected members
      setAssignments((prev) => {
        const updated = { ...prev };
        if (updated[itemId]) {
          delete updated[itemId][member];
        }
        return updated;
      });

      setSelectedMembers((prev) => ({
        ...prev,
        [itemId]: (prev[itemId] || []).filter((m: string) => m !== member),
      }));
    } else {
      updateAssignment(itemId, member, newQty);
    }
  };

  const toggleMemberSelection = (itemId: number, member: string) => {
    setSelectedMembers((prev) => {
      const currentSelected = prev[itemId] || [];
      const isSelected = currentSelected.includes(member);

      const newSelected = isSelected
        ? currentSelected.filter((m: string) => m !== member)
        : [...currentSelected, member];

      if (isSelected) {
        // If deselecting, remove from assignments
        setAssignments((prevAssignments) => {
          const updated = { ...prevAssignments };
          if (updated[itemId]) {
            delete updated[itemId][member];
          }
          return updated;
        });
      } else {
        // If selecting, set default quantity to 1
        setAssignments((prevAssignments) => ({
          ...prevAssignments,
          [itemId]: {
            ...prevAssignments[itemId],
            [member]: 1.0,
          },
        }));
      }

      return {
        ...prev,
        [itemId]: newSelected,
      };
    });
  };

  const parseBillText = () => {
    if (!billText.trim()) return;

    const lines = billText.split("\n").filter((line) => line.trim());
    const parsedItems = [];
    let foundTax = false;

    for (const line of lines) {
      // Clean up the line and split by spaces
      const cleanLine = line.trim().replace(/\s+/g, " ");

      // Try to match various bill formats
      const patterns = [
        // Format: Name qty unitPrice total (like your sample)
        /^(.+?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)$/,
        // Format: Name qty x price = total
        /^(.+?)\s+(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)\s*=?\s*(\d+(?:\.\d+)?)$/i,
        // Format: Name qty @ price = total
        /^(.+?)\s+(\d+(?:\.\d+)?)\s*@\s*(\d+(?:\.\d+)?)\s*=?\s*(\d+(?:\.\d+)?)$/i,
      ];

      for (const pattern of patterns) {
        const match = cleanLine.match(pattern);
        if (match) {
          const [, name, qty, price, total] = match;
          const parsedQty = parseFloat(qty);
          const parsedPrice = parseFloat(price);
          const parsedTotal = parseFloat(total);

          // Verify the calculation makes sense
          const calculatedTotal = parsedQty * parsedPrice;
          if (Math.abs(calculatedTotal - parsedTotal) < 0.01) {
            parsedItems.push({
              id: parsedItems.length + 1,
              name: name.trim(),
              quantity: parsedQty,
              unitPrice: parsedPrice,
              total: parsedTotal,
            });
            break;
          }
        }
      }

      // Check for tax
      const taxMatch = line.match(/tax.*?(\d+(?:\.\d+)?)%/i);
      if (taxMatch && !foundTax) {
        setTaxRate(parseFloat(taxMatch[1]));
        foundTax = true;
      }
    }

    if (parsedItems.length > 0) {
      setItems(parsedItems);
      setShowPasteMode(false);
      setBillText("");
    } else {
      alert(
        "Could not parse any items from the bill. Please check the format."
      );
    }
  };

  const subtotal = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );
  const taxAmount = subtotal * (taxRate / 100);
  const calculatedTotal = subtotal + taxAmount;
  const grandTotal = roundOffTotal
    ? Math.round(calculatedTotal)
    : calculatedTotal;
  const roundOffAmount = grandTotal - calculatedTotal;

  const getAssignmentValidation = (itemId: number) => {
    const item = items.find((i) => i.id === itemId);
    const assignedQty = Object.values(assignments[itemId] || {}).reduce(
      (sum, qty) => sum + qty,
      0
    );
    const isValid = item ? Math.abs(assignedQty - item.quantity) < 0.01 : false;
    return { assignedQty, isValid };
  };

  const calculateMemberTotals = () => {
    const memberTotals: { [key: string]: number } = {};
    const memberOrders: { [key: string]: any[] } = {};

    members.forEach((member) => {
      memberTotals[member] = 0;
      memberOrders[member] = [];
    });

    items.forEach((item) => {
      const itemAssignments = assignments[item.id] || {};
      const itemCostPerUnit = item.unitPrice;

      Object.entries(itemAssignments).forEach(([member, qty]) => {
        if (qty > 0) {
          memberTotals[member] += itemCostPerUnit * qty;
          memberOrders[member].push({
            name: item.name || `Item ${item.id}`,
            quantity: qty,
            unitPrice: itemCostPerUnit,
            total: itemCostPerUnit * qty,
          });
        }
      });
    });

    // Apply tax and round-off proportionally
    const totalBeforeTax = Object.values(memberTotals).reduce(
      (sum, total) => sum + total,
      0
    );

    if (totalBeforeTax > 0) {
      Object.keys(memberTotals).forEach((member) => {
        const proportion = memberTotals[member] / totalBeforeTax;
        const withTax = memberTotals[member] * (1 + taxRate / 100);
        const withRoundOff = withTax + roundOffAmount * proportion;
        memberTotals[member] = withRoundOff;
      });
    }

    return { memberTotals, memberOrders };
  };

  const { memberTotals, memberOrders } = calculateMemberTotals();

  return (
    <div className="max-w-6xl mx-auto bg-white min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 my-6 text-center">
        Food Bill Splitter
      </h1>

      {/* Bill Input Section */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold text-gray-700">Bill Items</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowPasteMode(!showPasteMode)}
              className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
            >
              <Upload size={16} />
              Paste Bill
            </button>
            <button
              onClick={addItem}
              className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
            >
              <Plus size={16} />
              Add Item
            </button>
          </div>
        </div>

        {showPasteMode && (
          <div className="mb-4 p-3 bg-white rounded-lg border">
            <textarea
              value={billText}
              onChange={(e) => setBillText(e.target.value)}
              placeholder="Paste your bill here. Expected formats:&#10;• Bru Coffee 10 20.00 200.00&#10;• Item 2 x 25.50 = 51.00&#10;• Item 2 @ 25.50 = 51.00"
              className="w-full h-32 p-3 border rounded-lg resize-none"
            />
            <div className="flex gap-2 mt-3">
              <button
                onClick={parseBillText}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Parse Bill
              </button>
              <button
                onClick={() => setShowPasteMode(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <div className="min-w-[800px] py-1 rounded-lg border bg-white">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="flex gap-3 items-center py-2 border-b-1 last:border-b-0"
              >
                <span className="w-10 text-center font-medium text-gray-500">
                  {index + 1}
                </span>
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => updateItem(item.id, "name", e.target.value)}
                  placeholder="Item name"
                  className="flex-1 p-2 border rounded-lg"
                />
                <input
                  type="number"
                  value={item.unitPrice || ""}
                  onChange={(e) =>
                    updateItem(item.id, "unitPrice", e.target.value)
                  }
                  placeholder="Unit Price"
                  step="0.01"
                  className="w-24 p-2 border rounded-lg text-right"
                />
                <span className="text-gray-500">×</span>
                <input
                  type="number"
                  value={item.quantity || ""}
                  onChange={(e) =>
                    updateItem(item.id, "quantity", e.target.value)
                  }
                  placeholder="Qty"
                  step="0.01"
                  className="w-20 p-2 border rounded-lg text-right"
                />
                <span className="text-gray-500">=</span>
                <span className="w-24 text-right font-semibold">
                  ₹{(item.unitPrice * item.quantity).toFixed(2)}
                </span>
                <button
                  onClick={() => removeItem(item.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  disabled={items.length === 1}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 bg-white p-3 rounded-lg border">
          <div className="flex justify-between items-center mb-2">
            <span>Subtotal:</span>
            <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <span>Tax:</span>
              <input
                type="number"
                value={taxRate || ""}
                onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                placeholder="0"
                step="0.1"
                className="w-16 p-1 border rounded text-right"
              />
              <span>%</span>
            </div>
            <span className="font-semibold">₹{taxAmount.toFixed(2)}</span>
          </div>
          {roundOffTotal && roundOffAmount !== 0 && (
            <div className="flex justify-between items-center mb-2">
              <span>Round-off:</span>
              <span className="font-semibold text-blue-600">
                ₹{roundOffAmount.toFixed(2)}
              </span>
            </div>
          )}
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={roundOffTotal}
                  onChange={(e) => setRoundOffTotal(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Round off total</span>
              </label>
            </div>
          </div>
          <div className="flex justify-between items-center text-lg font-bold border-t pt-2">
            <span>Grand Total:</span>
            <span>₹{grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Members Section */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <h2 className="text-xl font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Users size={20} />
          Members
        </h2>

        <div className="mb-3 p-3 bg-white rounded-lg border">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              placeholder="Enter member name or paste comma/tab separated list"
              className="flex-1 p-2 border rounded-lg"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  if (
                    newMemberName.includes(",") ||
                    newMemberName.includes("\t")
                  ) {
                    addMultipleMembers(newMemberName);
                  } else {
                    addMember();
                  }
                }
              }}
              onPaste={(e) => {
                e.preventDefault();
                const pastedText = e.clipboardData.getData("text");
                if (
                  pastedText.includes(",") ||
                  pastedText.includes("\t") ||
                  pastedText.includes("\n")
                ) {
                  addMultipleMembers(pastedText);
                } else {
                  setNewMemberName(pastedText.trim());
                }
              }}
            />
            <button
              onClick={() => {
                if (
                  newMemberName.includes(",") ||
                  newMemberName.includes("\t")
                ) {
                  addMultipleMembers(newMemberName);
                } else {
                  addMember();
                }
              }}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Add
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {members.map((member) => (
            <div
              key={member}
              className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border"
            >
              <span>{member}</span>
              <button
                onClick={() => removeMember(member)}
                className="text-red-500 hover:bg-red-50 rounded p-1"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {members.length === 0 && (
            <p className="text-gray-500 italic">No members added yet</p>
          )}
        </div>
      </div>

      {/* Assignment Section */}
      {members.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">
            Item Assignments
          </h2>
          <div className="space-y-3">
            {items.map((item) => {
              const { assignedQty, isValid } = getAssignmentValidation(item.id);
              const itemSelectedMembers = selectedMembers[item.id] || [];

              return (
                <div key={item.id} className="bg-white p-3 rounded-lg border">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">
                      {item.name || `Item ${item.id}`}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">
                        Assigned: {assignedQty.toFixed(1)} / Required:{" "}
                        {item.quantity}
                      </span>
                      {isValid ? (
                        <CheckCircle className="text-green-500" size={16} />
                      ) : (
                        <AlertCircle className="text-red-500" size={16} />
                      )}
                    </div>
                  </div>

                  {/* Member Selection - Hide when assigned = required */}
                  {!isValid && (
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Members:
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {members.map((member) => {
                          const isSelected =
                            itemSelectedMembers.includes(member);
                          return (
                            <button
                              key={member}
                              onClick={() =>
                                toggleMemberSelection(item.id, member)
                              }
                              className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                                isSelected
                                  ? "bg-blue-500 text-white border-blue-500"
                                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              {member}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Quantity Inputs for Selected Members - in same order as members list */}
                  {itemSelectedMembers.length > 0 && (
                    <div className="space-y-2">
                      {members
                        .filter((member) =>
                          itemSelectedMembers.includes(member)
                        )
                        .map((member) => (
                          <div
                            key={member}
                            className="flex items-center justify-between bg-gray-50 p-2 rounded"
                          >
                            <label className="font-medium text-sm">
                              {member}
                            </label>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  adjustQuantity(item.id, member, -1)
                                }
                                className="w-8 h-8 flex items-center justify-center bg-red-100 text-red-600 rounded-full hover:bg-red-200 text-sm"
                              >
                                −
                              </button>
                              <input
                                type="number"
                                value={assignments[item.id]?.[member] || ""}
                                onChange={(e) =>
                                  updateAssignment(
                                    item.id,
                                    member,
                                    e.target.value
                                  )
                                }
                                step="0.01"
                                min="0"
                                className="w-16 p-1 border rounded text-center text-sm"
                              />
                              <button
                                onClick={() =>
                                  adjustQuantity(item.id, member, 1)
                                }
                                className="w-8 h-8 flex items-center justify-center bg-green-100 text-green-600 rounded-full hover:bg-green-200 text-sm"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}

                  {itemSelectedMembers.length === 0 && (
                    <p className="text-gray-500 italic text-sm">
                      No members selected for this item
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Results Section */}
      {members.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h2 className="text-xl font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Calculator size={20} />
            Payment Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(memberTotals).map(([member, total]) => (
              <div key={member} className="bg-white p-3 rounded-lg border">
                <h3 className="font-semibold text-lg mb-2 text-center">
                  {member}
                </h3>

                {/* Order Summary */}
                <div className="mb-3 max-h-32 overflow-y-auto">
                  {memberOrders[member].length > 0 ? (
                    <div className="space-y-1">
                      {memberOrders[member].map(
                        (
                          orderItem: {
                            name:
                              | string
                              | number
                              | bigint
                              | boolean
                              | React.ReactElement<
                                  unknown,
                                  string | React.JSXElementConstructor<any>
                                >
                              | Iterable<React.ReactNode>
                              | React.ReactPortal
                              | Promise<
                                  | string
                                  | number
                                  | bigint
                                  | boolean
                                  | React.ReactPortal
                                  | React.ReactElement<
                                      unknown,
                                      string | React.JSXElementConstructor<any>
                                    >
                                  | Iterable<React.ReactNode>
                                  | null
                                  | undefined
                                >
                              | null
                              | undefined;
                            quantity: number;
                            total: number;
                          },
                          index: React.Key | null | undefined
                        ) => (
                          <div
                            key={index}
                            className="flex justify-between items-center text-xs bg-gray-50 p-1 rounded"
                          >
                            <span className="flex-1 truncate">
                              {orderItem.name}{" "}
                              {orderItem.quantity > 1
                                ? `×${orderItem.quantity}`
                                : ""}
                            </span>
                            <span className="font-medium">
                              ₹{orderItem.total.toFixed(2)}
                            </span>
                          </div>
                        )
                      )}
                      {taxRate > 0 && (
                        <div className="flex justify-between items-center text-xs text-gray-600 pt-1 border-t">
                          <span>Tax ({taxRate}%)</span>
                          <span>
                            ₹
                            {(
                              total -
                              memberOrders[member].reduce(
                                (sum: any, item: { total: any }) =>
                                  sum + item.total,
                                0
                              ) -
                              roundOffAmount *
                                ((memberOrders[member].reduce(
                                  (sum: any, item: { total: any }) =>
                                    sum + item.total,
                                  0
                                ) /
                                  Object.values(memberTotals).reduce(
                                    (sum, t) => sum + t,
                                    0
                                  )) *
                                  (grandTotal - calculatedTotal))
                            ).toFixed(2)}
                          </span>
                        </div>
                      )}
                      {roundOffTotal && roundOffAmount !== 0 && (
                        <div className="flex justify-between items-center text-xs text-blue-600">
                          <span>Round-off</span>
                          <span>
                            ₹
                            {(
                              roundOffAmount *
                              (memberOrders[member].reduce(
                                (sum: any, item: { total: any }) =>
                                  sum + item.total,
                                0
                              ) /
                                Object.values(memberOrders).reduce(
                                  (sum, orders) =>
                                    sum +
                                    orders.reduce(
                                      (s: any, item: { total: any }) =>
                                        s + item.total,
                                      0
                                    ),
                                  0
                                ))
                            ).toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 italic text-center py-2">
                      No items assigned
                    </p>
                  )}
                </div>

                {/* Total */}
                <div className="text-center border-t pt-2">
                  <p className="text-2xl font-bold text-green-600">
                    ₹{total.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-800">
              <div>
                <strong>Total Assigned:</strong> ₹
                {Object.values(memberTotals)
                  .reduce((sum, total) => sum + total, 0)
                  .toFixed(2)}
              </div>
              <div>
                <strong>Grand Total:</strong> ₹{grandTotal.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillSplitter;
