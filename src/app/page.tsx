import { WikiCard } from "@/components/ui/wiki-card";

export default function Home() {
  return (
    <div>
      <main className="max-w-2xl mx-auto mt-10 flex flex-col gap-6">
        <WikiCard
          title="James Webb Space Telescope"
          author="Wikipedia contributors"
          date="December 25, 2021"
          summary="The James Webb Space Telescope is a space observatory designed to conduct infrared astronomy. Its high-resolution and high-sensitivity instruments allow it to view objects too old, distant, or faint for the Hubble Space Telescope."
          href="https://en.wikipedia.org/wiki/James_Webb_Space_Telescope"
        />
        <WikiCard
          title="Voyager 1"
          author="Wikipedia contributors"
          date="September 5, 1977"
          summary="Voyager 1 is a space probe launched by NASA on September 5, 1977. It is currently the farthest human-made object from Earth and the first spacecraft to reach interstellar space."
          href="https://en.wikipedia.org/wiki/Voyager_1"
        />
        <WikiCard
          title="Library of Alexandria"
          author="Wikipedia contributors"
          date="c. 285–246 BC"
          summary="The Great Library of Alexandria in Alexandria, Egypt, was one of the largest and most significant libraries of the ancient world. It was dedicated to the Muses, the nine goddesses of the arts."
          href="https://en.wikipedia.org/wiki/Library_of_Alexandria"
        />
        <WikiCard
          title="Mariana Trench"
          author="Wikipedia contributors"
          date="1875"
          summary="The Mariana Trench is the deepest oceanic trench on Earth. It is located in the western Pacific Ocean about 200 kilometres east of the Mariana Islands; it is the deepest topographic depression in the world."
          href="https://en.wikipedia.org/wiki/Mariana_Trench"
        />
      </main>
    </div>
  );
}
