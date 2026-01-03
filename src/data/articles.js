const articles = [
  // 1
  {
    id: 1,
    category: "Arts",
    type: "poem",
    title: "HOW NOAH BAUMBACH FELL (BACK) IN LOVE WITH THE MOVIES",
    description:
      "A poem-like reflection on rediscovering cinema in an age of noisy storytelling.",
    author: "Susan Morrison",
    date: "November 30, 2025",
    image: "https://images.unsplash.com/photo-1501706362039-c06b2d715385?auto=format",
    content:
      "He walked into the silent hall where reels once breathed on their own. Each frame felt like a forgotten memory, turning slowly into light...",
  },

  // 2
  {
    id: 2,
    category: "Health",
    type: "article",
    title: "The Undermining of the C.D.C.",
    description:
      "A deep look into how political pressure reshaped scientific communication.",
    author: "Sheryl Stolberg",
    date: "December 1, 2025",
    image: "https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format",
    content:
      "For decades, the C.D.C. stood as a global model. But over time, the lines between science and politics blurred...",
  },

  // 3
  {
    id: 3,
    category: "Environment",
    type: "article",
    title: "Wildlife & Climate Change",
    description:
      "How rising temperatures distort migration, feeding cycles, and survival.",
    author: "Liam Carter",
    date: "December 2, 2025",
    image: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format",
    content:
      "The birds came early this year. So early that farmers barely recognized their patterns. Climate change is not a distant threat—it is a living disruption...",
  },

  // 4
  {
    id: 4,
    category: "Economics",
    type: "essay",
    title: "The Silent Crash of Local Markets",
    description:
      "Small-town economies collapse quietly while global players grow louder.",
    author: "Riya Menon",
    date: "December 3, 2025",
    image: "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format",
    content:
      "In many rural regions, markets don’t crash with noise—they fade. Shops close one by one, not because of failure, but due to the slow erosion of opportunity...",
  },

  // 5
  {
    id: 5,
    category: "Jurisprudence",
    type: "coverstory",
    title: "Who Owns the Law?",
    description:
      "In the digital era, the meaning of ownership in legal systems is evolving rapidly.",
    author: "Ahmed Yusuf",
    date: "December 4, 2025",
    image: "https://images.unsplash.com/photo-1555374018-13a8994ab246?auto=format",
    content:
      "The idea that law belongs to the people is older than democracy itself. Yet corporations, algorithms, and global courts are quietly redefining that belief...",
  },

  // 6
  {
    id: 6,
    category: "Technology",
    type: "article",
    title: "AI and the Future of Work",
    description:
      "Automation is rewriting job roles across every major industry.",
    author: "Zara Joseph",
    date: "December 4, 2025",
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format",
    content:
      "By 2030, almost every repetitive task will be automated. The real question isn't job loss—it’s job transformation...",
  },

  // 7
  {
    id: 7,
    category: "Politics",
    type: "story",
    title: "Inside the Corridors of Power",
    description:
      "A dramatic story about a whistleblower trapped between truth and loyalty.",
    author: "Mark Peters",
    date: "December 5, 2025",
    image: "https://images.unsplash.com/photo-1505842465776-3b4953ca4f44?auto=format",
    content:
      "He stood outside the minister’s chamber, folder in hand, heart beating like a war drum. Inside, decisions were made that shaped nations...",
  },

  // 8
  {
    id: 8,
    category: "Society",
    type: "poem",
    title: "The City Without Sleep",
    description:
      "A poetic narration of loneliness hiding within bright lights.",
    author: "Hiba Salman",
    date: "December 6, 2025",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format",
    content:
      "Under neon skies, the city hums. Yet beneath the humming, shadows wander without names, searching for warmth...",
  },

  // 9
  {
    id: 9,
    category: "Economics",
    type: "article",
    title: "The New Inflation Wave",
    description:
      "A global explanation of why essentials are becoming luxury goods.",
    author: "Daniel White",
    date: "December 7, 2025",
    image:
      "https://images.unsplash.com/photo-1526304640581-87d1c9c6a7a1?auto=format",
    content:
      "Inflation is not just increasing—it's changing shape. Instead of sudden spikes, we see rolling waves that affect everyday life...",
  },

  // 10
  {
    id: 10,
    category: "Culture",
    type: "story",
    title: "Voices From the Old Market",
    description:
      "A story capturing the memories of a disappearing traditional market.",
    author: "Fatima Noor",
    date: "December 8, 2025",
    image:
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a05d87?auto=format",
    content:
      "The market smelled of spices and warm bread. But more than that, it held decades of laughter, arguments, and stories told at dusk...",
  },

  // 11
  {
    id: 11,
    category: "Philosophy",
    type: "essay",
    title: "The Logic of Desire",
    description:
      "An essay exploring how human desire shapes decisions.",
    author: "Mira O’Connell",
    date: "December 9, 2025",
    image:
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format",
    content:
      "Desire is rarely logical, yet it guides us more than reason. The unseen force behind ambition, fear, and longing...",
  },

  // 12
  {
    id: 12,
    category: "Environment",
    type: "article",
    title: "Oceans Without Fish",
    description:
      "Marine scientists warn that fish populations may collapse by 2040.",
    author: "Kai Mendoza",
    date: "December 10, 2025",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format",
    content:
      "The sea has always been generous. But decades of overfishing and warming waters are pushing it beyond recovery...",
  },

  // 13
  {
    id: 13,
    category: "Technology",
    type: "essay",
    title: "The Data We Never Agreed to Give",
    description:
      "A philosophical take on privacy in the algorithmic era.",
    author: "Sophia Hill",
    date: "December 11, 2025",
    image:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format",
    content:
      "Our devices know more about us than our closest friends do—yet we never explicitly allowed it...",
  },

  // 14
  {
    id: 14,
    category: "Culture",
    type: "poem",
    title: "Rain on Old Letters",
    description:
      "A soft poem about lost love, ink, and passing seasons.",
    author: "Nadia Mir",
    date: "December 12, 2025",
    image:
      "https://images.unsplash.com/photo-1492725764893-90b379c2b6e7?auto=format",
    content:
      "The rain fell gently, smudging the words you once wrote. Maybe some memories are meant to blur...",
  },

  // 15
  {
    id: 15,
    category: "Jurisprudence",
    type: "coverstory",
    title: "Condemning Millions for One Man’s Crime",
    description:
      "How collective punishment became a political weapon of the 21st century.",
    author: "George Packer",
    date: "December 13, 2025",
    image:
      "https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format",
    content:
      "History shows that when power is threatened, leaders often choose blame over justice. This story unpacks the roots of that dangerous ideology...",
  }
];

export default articles;
