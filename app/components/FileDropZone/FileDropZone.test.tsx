import { render, screen, fireEvent } from "@testing-library/react";
import FileDropZone from "./FileDropZone";

function createMockFile(name: string, type: string = "application/json"): File {
  return new File(["{}"], name, { type });
}

function createDragEvent(
  type: string,
  files: File[] = []
): Partial<React.DragEvent<HTMLDivElement>> {
  return {
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
    dataTransfer: {
      files: files as unknown as FileList,
    } as DataTransfer,
  };
}

describe("FileDropZone", () => {
  describe("Idle State", () => {
    it("should render in idle state by default", () => {
      render(<FileDropZone />);

      const dropZone = screen.getByTestId("file-drop-zone");
      expect(dropZone).toBeInTheDocument();
      expect(dropZone).toHaveAttribute("data-state", "idle");
      expect(
        screen.getByText("Upload a file to get started")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Drop JSON file here or click to browse")
      ).toBeInTheDocument();
    });

    it("should have dashed border styling", () => {
      render(<FileDropZone />);

      const dropZone = screen.getByTestId("file-drop-zone");
      expect(dropZone).toHaveClass("border-dashed");
    });
  });

  describe("Dragging State", () => {
    it("should show dragging state on drag enter", () => {
      render(<FileDropZone />);

      const dropZone = screen.getByTestId("file-drop-zone");
      const dragEvent = createDragEvent("dragenter");

      fireEvent.dragEnter(dropZone, dragEvent);

      expect(dropZone).toHaveAttribute("data-state", "dragging");
      expect(screen.getByText("Release to select")).toBeInTheDocument();
    });

    it("should return to idle state on drag leave", () => {
      render(<FileDropZone />);

      const dropZone = screen.getByTestId("file-drop-zone");

      fireEvent.dragEnter(dropZone, createDragEvent("dragenter"));
      expect(dropZone).toHaveAttribute("data-state", "dragging");

      fireEvent.dragLeave(dropZone, createDragEvent("dragleave"));
      expect(dropZone).toHaveAttribute("data-state", "idle");
    });

    it("should handle drag over without changing state from dragging", () => {
      render(<FileDropZone />);

      const dropZone = screen.getByTestId("file-drop-zone");

      fireEvent.dragEnter(dropZone, createDragEvent("dragenter"));
      expect(dropZone).toHaveAttribute("data-state", "dragging");

      fireEvent.dragOver(dropZone, createDragEvent("dragover"));
      expect(dropZone).toHaveAttribute("data-state", "dragging");
    });
  });

  describe("File Selection", () => {
    it("should show selected state when valid file is dropped", () => {
      render(<FileDropZone />);

      const dropZone = screen.getByTestId("file-drop-zone");
      const jsonFile = createMockFile("data.json");
      const dropEvent = createDragEvent("drop", [jsonFile]);

      fireEvent.drop(dropZone, dropEvent);

      expect(dropZone).toHaveAttribute("data-state", "selected");
      expect(screen.getByText("Selected: data.json")).toBeInTheDocument();
    });

    it("should call onFileSelected with file when valid file is dropped", () => {
      const onFileSelected = jest.fn();
      render(<FileDropZone onFileSelected={onFileSelected} />);

      const dropZone = screen.getByTestId("file-drop-zone");
      const jsonFile = createMockFile("data.json");
      const dropEvent = createDragEvent("drop", [jsonFile]);

      fireEvent.drop(dropZone, dropEvent);

      expect(onFileSelected).toHaveBeenCalledWith(jsonFile);
    });

    it("should reject non-JSON files", () => {
      const onError = jest.fn();
      render(<FileDropZone onError={onError} />);

      const dropZone = screen.getByTestId("file-drop-zone");
      const textFile = createMockFile("test.txt", "text/plain");
      const dropEvent = createDragEvent("drop", [textFile]);

      fireEvent.drop(dropZone, dropEvent);

      expect(dropZone).toHaveAttribute("data-state", "error");
      expect(
        screen.getByText("Only .json files are accepted")
      ).toBeInTheDocument();
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Only .json files are accepted" })
      );
    });

    it("should handle custom accept prop", () => {
      const onError = jest.fn();
      render(<FileDropZone accept=".csv" onError={onError} />);

      const dropZone = screen.getByTestId("file-drop-zone");
      const jsonFile = createMockFile("data.json");
      const dropEvent = createDragEvent("drop", [jsonFile]);

      fireEvent.drop(dropZone, dropEvent);

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Only .csv files are accepted" })
      );
    });

    it("should handle drop with no files", () => {
      const onFileSelected = jest.fn();
      render(<FileDropZone onFileSelected={onFileSelected} />);

      const dropZone = screen.getByTestId("file-drop-zone");
      const dropEvent = createDragEvent("drop", []);

      fireEvent.drop(dropZone, dropEvent);

      expect(dropZone).toHaveAttribute("data-state", "idle");
      expect(onFileSelected).not.toHaveBeenCalled();
    });
  });

  describe("Click to Select", () => {
    it("should have a hidden file input", () => {
      render(<FileDropZone />);

      const fileInput = screen.getByTestId("file-input");
      expect(fileInput).toBeInTheDocument();
      expect(fileInput).toHaveAttribute("type", "file");
      expect(fileInput).toHaveClass("hidden");
    });

    it("should have correct accept attribute on file input", () => {
      render(<FileDropZone accept=".csv" />);

      const fileInput = screen.getByTestId("file-input");
      expect(fileInput).toHaveAttribute("accept", ".csv");
    });

    it("should trigger file input when drop zone is clicked", () => {
      render(<FileDropZone />);

      const fileInput = screen.getByTestId("file-input") as HTMLInputElement;
      const clickSpy = jest.spyOn(fileInput, "click");

      const dropZone = screen.getByTestId("file-drop-zone");
      fireEvent.click(dropZone);

      expect(clickSpy).toHaveBeenCalled();
    });

    it("should call onFileSelected when file is selected via input", () => {
      const onFileSelected = jest.fn();
      render(<FileDropZone onFileSelected={onFileSelected} />);

      const fileInput = screen.getByTestId("file-input");
      const jsonFile = createMockFile("selected.json");

      fireEvent.change(fileInput, { target: { files: [jsonFile] } });

      expect(onFileSelected).toHaveBeenCalledWith(jsonFile);
    });

    it("should show selected state when file is selected via input", () => {
      render(<FileDropZone />);

      const dropZone = screen.getByTestId("file-drop-zone");
      const fileInput = screen.getByTestId("file-input");
      const jsonFile = createMockFile("selected.json");

      fireEvent.change(fileInput, { target: { files: [jsonFile] } });

      expect(dropZone).toHaveAttribute("data-state", "selected");
      expect(screen.getByText("Selected: selected.json")).toBeInTheDocument();
    });

    it("should reject invalid file type via file input", () => {
      const onError = jest.fn();
      render(<FileDropZone onError={onError} />);

      const fileInput = screen.getByTestId("file-input");
      const textFile = createMockFile("test.txt", "text/plain");

      fireEvent.change(fileInput, { target: { files: [textFile] } });

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Only .json files are accepted" })
      );
    });

    it("should handle file input change with no files", () => {
      const onFileSelected = jest.fn();
      render(<FileDropZone onFileSelected={onFileSelected} />);

      const fileInput = screen.getByTestId("file-input");
      fireEvent.change(fileInput, { target: { files: [] } });

      expect(onFileSelected).not.toHaveBeenCalled();
    });

    it("should reset file input value after selection", () => {
      render(<FileDropZone />);

      const fileInput = screen.getByTestId("file-input") as HTMLInputElement;
      const jsonFile = createMockFile("data.json");

      fireEvent.change(fileInput, { target: { files: [jsonFile] } });

      expect(fileInput.value).toBe("");
    });
  });

  describe("Cancel Selection", () => {
    it("should show cancel button when file is selected", () => {
      render(<FileDropZone />);

      const dropZone = screen.getByTestId("file-drop-zone");
      const jsonFile = createMockFile("data.json");

      fireEvent.drop(dropZone, createDragEvent("drop", [jsonFile]));

      expect(screen.getByTestId("clear-file-button")).toBeInTheDocument();
      expect(screen.getByText("Cancel")).toBeInTheDocument();
    });

    it("should not show cancel button in idle state", () => {
      render(<FileDropZone />);

      expect(screen.queryByTestId("clear-file-button")).not.toBeInTheDocument();
    });

    it("should return to idle state when cancel is clicked", () => {
      render(<FileDropZone />);

      const dropZone = screen.getByTestId("file-drop-zone");
      const jsonFile = createMockFile("data.json");

      fireEvent.drop(dropZone, createDragEvent("drop", [jsonFile]));
      expect(dropZone).toHaveAttribute("data-state", "selected");

      fireEvent.click(screen.getByTestId("clear-file-button"));

      expect(dropZone).toHaveAttribute("data-state", "idle");
      expect(screen.queryByTestId("clear-file-button")).not.toBeInTheDocument();
    });

    it("should call onFileSelected with null when cancel is clicked", () => {
      const onFileSelected = jest.fn();
      render(<FileDropZone onFileSelected={onFileSelected} />);

      const dropZone = screen.getByTestId("file-drop-zone");
      const jsonFile = createMockFile("data.json");

      fireEvent.drop(dropZone, createDragEvent("drop", [jsonFile]));
      expect(onFileSelected).toHaveBeenCalledWith(jsonFile);

      fireEvent.click(screen.getByTestId("clear-file-button"));

      expect(onFileSelected).toHaveBeenCalledWith(null);
    });

    it("should not trigger file picker when cancel is clicked", () => {
      render(<FileDropZone />);

      const dropZone = screen.getByTestId("file-drop-zone");
      const jsonFile = createMockFile("data.json");

      fireEvent.drop(dropZone, createDragEvent("drop", [jsonFile]));

      const fileInput = screen.getByTestId("file-input") as HTMLInputElement;
      const clickSpy = jest.spyOn(fileInput, "click");

      fireEvent.click(screen.getByTestId("clear-file-button"));

      expect(clickSpy).not.toHaveBeenCalled();
    });

    it("should clear selection when Escape key is pressed", () => {
      render(<FileDropZone />);

      const dropZone = screen.getByTestId("file-drop-zone");
      const jsonFile = createMockFile("data.json");

      fireEvent.drop(dropZone, createDragEvent("drop", [jsonFile]));
      expect(dropZone).toHaveAttribute("data-state", "selected");

      fireEvent.keyDown(document, { key: "Escape" });

      expect(dropZone).toHaveAttribute("data-state", "idle");
    });

    it("should call onFileSelected with null when Escape is pressed", () => {
      const onFileSelected = jest.fn();
      render(<FileDropZone onFileSelected={onFileSelected} />);

      const dropZone = screen.getByTestId("file-drop-zone");
      const jsonFile = createMockFile("data.json");

      fireEvent.drop(dropZone, createDragEvent("drop", [jsonFile]));

      fireEvent.keyDown(document, { key: "Escape" });

      expect(onFileSelected).toHaveBeenLastCalledWith(null);
    });

    it("should not clear when Escape is pressed in idle state", () => {
      const onFileSelected = jest.fn();
      render(<FileDropZone onFileSelected={onFileSelected} />);

      fireEvent.keyDown(document, { key: "Escape" });

      expect(onFileSelected).not.toHaveBeenCalled();
    });
  });

  describe("Styling", () => {
    it("should have green border when file is selected", () => {
      render(<FileDropZone />);

      const dropZone = screen.getByTestId("file-drop-zone");
      const jsonFile = createMockFile("data.json");

      fireEvent.drop(dropZone, createDragEvent("drop", [jsonFile]));

      expect(dropZone).toHaveClass("border-green-500");
    });

    it("should have red border on error", () => {
      render(<FileDropZone />);

      const dropZone = screen.getByTestId("file-drop-zone");
      const textFile = createMockFile("test.txt", "text/plain");

      fireEvent.drop(dropZone, createDragEvent("drop", [textFile]));

      expect(dropZone).toHaveClass("border-red-500");
    });

    it("should have blue border when dragging", () => {
      render(<FileDropZone />);

      const dropZone = screen.getByTestId("file-drop-zone");

      fireEvent.dragEnter(dropZone, createDragEvent("dragenter"));

      expect(dropZone).toHaveClass("border-blue-500");
    });
  });
});
