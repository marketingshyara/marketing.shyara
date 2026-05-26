import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SignInHelpCard } from "./SignInHelpCard";
import { passwordCopy } from "../../lib/passwordCopy";

describe("SignInHelpCard", () => {
  it("renders help title and numbered steps", () => {
    render(<SignInHelpCard />);

    expect(screen.getByRole("heading", { name: passwordCopy.signInHelpTitle })).toBeInTheDocument();
    expect(screen.getByText(passwordCopy.signInHelpStep1)).toBeInTheDocument();
    expect(screen.getByText(passwordCopy.signInHelpStep2)).toBeInTheDocument();
    expect(screen.getByText(passwordCopy.signInHelpStep3)).toBeInTheDocument();
  });
});
