import { render, screen, fireEvent } from "@testing-library/react";
import SubmitButton from "./SubmitButton";

describe("SubmitButton", () => {
  describe("Rendering", () => {
    it("should render with correct test id", () => {
      render(<SubmitButton state="ready" onClick={() => {}} />);

      expect(screen.getByTestId("submit-button")).toBeInTheDocument();
    });

    it("should display gear emoji", () => {
      render(<SubmitButton state="ready" onClick={() => {}} />);

      expect(screen.getByText("⚙️")).toBeInTheDocument();
    });

    it("should set data-state attribute", () => {
      render(<SubmitButton state="ready" onClick={() => {}} />);

      expect(screen.getByTestId("submit-button")).toHaveAttribute(
        "data-state",
        "ready"
      );
    });
  });

  describe("Disabled State", () => {
    it("should be disabled when state is disabled", () => {
      render(<SubmitButton state="disabled" onClick={() => {}} />);

      expect(screen.getByTestId("submit-button")).toBeDisabled();
    });

    it("should be disabled when state is uploading", () => {
      render(<SubmitButton state="uploading" onClick={() => {}} />);

      expect(screen.getByTestId("submit-button")).toBeDisabled();
    });

    it("should not be disabled when state is ready", () => {
      render(<SubmitButton state="ready" onClick={() => {}} />);

      expect(screen.getByTestId("submit-button")).not.toBeDisabled();
    });

    it("should not be disabled when state is success", () => {
      render(<SubmitButton state="success" onClick={() => {}} />);

      expect(screen.getByTestId("submit-button")).not.toBeDisabled();
    });

    it("should not be disabled when state is error", () => {
      render(<SubmitButton state="error" onClick={() => {}} />);

      expect(screen.getByTestId("submit-button")).not.toBeDisabled();
    });
  });

  describe("Click Handling", () => {
    it("should call onClick when clicked in ready state", () => {
      const onClick = jest.fn();
      render(<SubmitButton state="ready" onClick={onClick} />);

      fireEvent.click(screen.getByTestId("submit-button"));

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("should call onClick when clicked in error state", () => {
      const onClick = jest.fn();
      render(<SubmitButton state="error" onClick={onClick} />);

      fireEvent.click(screen.getByTestId("submit-button"));

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("should not call onClick when disabled", () => {
      const onClick = jest.fn();
      render(<SubmitButton state="disabled" onClick={onClick} />);

      fireEvent.click(screen.getByTestId("submit-button"));

      expect(onClick).not.toHaveBeenCalled();
    });

    it("should not call onClick when uploading", () => {
      const onClick = jest.fn();
      render(<SubmitButton state="uploading" onClick={onClick} />);

      fireEvent.click(screen.getByTestId("submit-button"));

      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe("Styling", () => {
    it("should have green background when ready", () => {
      render(<SubmitButton state="ready" onClick={() => {}} />);

      expect(screen.getByTestId("submit-button")).toHaveClass("bg-green-500");
    });

    it("should have red background when error", () => {
      render(<SubmitButton state="error" onClick={() => {}} />);

      expect(screen.getByTestId("submit-button")).toHaveClass("bg-red-500");
    });

    it("should have animate-pulse when uploading", () => {
      render(<SubmitButton state="uploading" onClick={() => {}} />);

      expect(screen.getByTestId("submit-button")).toHaveClass("animate-pulse");
    });

    it("should be square shaped", () => {
      render(<SubmitButton state="ready" onClick={() => {}} />);

      const button = screen.getByTestId("submit-button");
      expect(button).toHaveClass("h-18", "w-18");
    });
  });
});
