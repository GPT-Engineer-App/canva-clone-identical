import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SketchPicker } from "react-color";

const Index = () => {
  const canvasRef = useRef(null);
  const [tool, setTool] = useState("rectangle");
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [fillColor, setFillColor] = useState("#ffffff");
  const [lineWidth, setLineWidth] = useState(2);
  const [fontSize, setFontSize] = useState(16);
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const startX = e.clientX - rect.left;
    const startY = e.clientY - rect.top;

    const drawShape = (e) => {
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.putImageData(history[history.length - 1], 0, 0);

      ctx.strokeStyle = strokeColor;
      ctx.fillStyle = fillColor;
      ctx.lineWidth = lineWidth;

      if (tool === "rectangle") {
        ctx.strokeRect(startX, startY, currentX - startX, currentY - startY);
        ctx.fillRect(startX, startY, currentX - startX, currentY - startY);
      } else if (tool === "circle") {
        const radius = Math.sqrt(Math.pow(currentX - startX, 2) + Math.pow(currentY - startY, 2));
        ctx.beginPath();
        ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fill();
      } else if (tool === "line") {
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(currentX, currentY);
        ctx.stroke();
      }
    };

    const stopDrawing = () => {
      canvas.removeEventListener("mousemove", drawShape);
      canvas.removeEventListener("mouseup", stopDrawing);
      setHistory([...history, ctx.getImageData(0, 0, canvas.width, canvas.height)]);
      setRedoStack([]);
    };

    canvas.addEventListener("mousemove", drawShape);
    canvas.addEventListener("mouseup", stopDrawing);
  };

  const handleUndo = () => {
    if (history.length > 0) {
      const newHistory = [...history];
      const lastState = newHistory.pop();
      setRedoStack([...redoStack, lastState]);
      setHistory(newHistory);

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (newHistory.length > 0) {
        ctx.putImageData(newHistory[newHistory.length - 1], 0, 0);
      }
    }
  };

  const handleRedo = () => {
    if (redoStack.length > 0) {
      const newRedoStack = [...redoStack];
      const lastState = newRedoStack.pop();
      setHistory([...history, lastState]);
      setRedoStack(newRedoStack);

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      ctx.putImageData(lastState, 0, 0);
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHistory([]);
    setRedoStack([]);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    const link = document.createElement("a");
    link.download = "canvas.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-3xl mb-4">Canvas Drawing App</h1>
      <p className="mb-4">Create and customize your drawings with ease.</p>
      <div className="flex flex-col md:flex-row items-center mb-4 space-y-4 md:space-y-0 md:space-x-4">
        <Select onValueChange={setTool}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Tool" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rectangle">Rectangle</SelectItem>
            <SelectItem value="circle">Circle</SelectItem>
            <SelectItem value="line">Line</SelectItem>
            <SelectItem value="text">Text</SelectItem>
          </SelectContent>
        </Select>
        <SketchPicker color={strokeColor} onChangeComplete={(color) => setStrokeColor(color.hex)} />
        <SketchPicker color={fillColor} onChangeComplete={(color) => setFillColor(color.hex)} />
        <Input type="number" value={lineWidth} onChange={(e) => setLineWidth(e.target.value)} placeholder="Line Width" />
        <Input type="number" value={fontSize} onChange={(e) => setFontSize(e.target.value)} placeholder="Font Size" />
        <Button onClick={handleUndo}>Undo</Button>
        <Button onClick={handleRedo}>Redo</Button>
        <Button onClick={handleClear}>Clear</Button>
        <Button onClick={handleSave}>Save</Button>
      </div>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="border"
        onMouseDown={handleMouseDown}
      ></canvas>
    </div>
  );
};

export default Index;