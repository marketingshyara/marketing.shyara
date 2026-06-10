import { act, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HeroSampleCarousel } from "./HeroSampleCarousel";
import { websiteSamplesWithPosters } from "@/lib/websiteSamplesManifest";

describe("HeroSampleCarousel", () => {
  it("renders bundled sample hero posters immediately", () => {
    render(<HeroSampleCarousel />);

    const slides = websiteSamplesWithPosters();
    expect(slides.length).toBeGreaterThan(0);

    const first = slides[0];
    const img = screen.getByAltText(first.alt);
    expect(img).toHaveAttribute("src", first.src);
  });

  it("advances to the next poster every 3 seconds", async () => {
    const slides = websiteSamplesWithPosters();
    if (slides.length < 2) return;

    render(<HeroSampleCarousel />);

    expect(screen.getByAltText(slides[0].alt)).toBeInTheDocument();

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 3100));
    });

    expect(screen.getByAltText(slides[1].alt)).toBeInTheDocument();
  });
});
