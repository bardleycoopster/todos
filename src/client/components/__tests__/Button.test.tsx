import React from "react";
import { render, screen } from "@testing-library/react";
import Button from "../Button";

describe("<Button />", () => {
  test("renders button with text", () => {
    const testContent = "test";

    render(<Button>{testContent}</Button>);

    const button = screen.getByText(testContent);
    expect(button).toBeInTheDocument();
  });
});
