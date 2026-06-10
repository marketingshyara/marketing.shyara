import { act, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HeroSampleCarousel } from "./HeroSampleCarousel";

const manifest = {
  categories: [],
  samples: [
    {
      id: "restaurant-classic-website",
      displayCode: "RES/001",
      name: "Restaurant Website",
      description: "Sample",
      folder: "restaurant-classic-website",
      file: "index.html",
      category: "restaurants",
      posterUrl: "/samples/websites/restaurant-classic-website/poster.jpg",
    },
    {
      id: "gym-ironforge-website",
      displayCode: "GYM/001",
      name: "Gym Website",
      description: "Sample",
      folder: "gym-ironforge-website",
      file: "index.html",
      category: "fitness",
      posterUrl: "/samples/websites/gym-ironforge-website/poster.jpg",
    },
  ],
};

describe("HeroSampleCarousel", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => manifest,
      })
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("renders sample hero posters from manifest", async () => {
    render(<HeroSampleCarousel />);

    await waitFor(() => {
      expect(screen.getByAltText(/Restaurant Website/i)).toBeInTheDocument();
    });

    expect(screen.getByAltText(/Restaurant Website/i)).toHaveAttribute(
      "src",
      "/samples/websites/restaurant-classic-website/poster.jpg"
    );
  });

  it("advances to the next poster every 3 seconds", async () => {
    render(<HeroSampleCarousel />);

    await screen.findByAltText(/Restaurant Website/i);

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 3100));
    });

    expect(screen.getByAltText(/Gym Website/i)).toBeInTheDocument();
  });
});
