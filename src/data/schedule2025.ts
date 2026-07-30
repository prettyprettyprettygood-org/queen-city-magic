export interface ScheduleEvent {
  time: string;
  title: string;
  location?: string;
}

export interface ScheduleStage {
  /** Omitted for the day's main timeline (as opposed to a named performance stage). */
  name?: string;
  events: ScheduleEvent[];
}

export interface ScheduleDay {
  day: string;
  stages: ScheduleStage[];
}

// Placeholder sample schedule — swap this array for the real lineup once it's published;
// ScheduleTimeline.astro only needs this data to change.
export const schedule2025: ScheduleDay[] = [
  {
    day: "Saturday",
    stages: [
      {
        events: [
          { time: "8:00 a.m.", title: "Shuttles Begin" },
          { time: "9:00 a.m.", title: "Festival Opens" },
          {
            time: "9:00 a.m.–12:00 p.m.",
            title: "Lorem Ipsum Dolor",
            location: "Town Square",
          },
          { time: "9:30 a.m.", title: "Sit Amet Consectetur" },
          {
            time: "10:00 a.m.–7:00 p.m.",
            title: "Merch Table & Refreshment Tent Open",
          },
          {
            time: "10:00 a.m.–3:00 p.m.",
            title: "Adipiscing Elit Sed",
            location: "Main Lawn",
          },
          {
            time: "10:00 a.m.–5:30 p.m.",
            title: "Tempor Incididunt",
            location: "River Walk",
          },
          {
            time: "10:00 a.m.–6:00 p.m.",
            title: "Labore Et Dolore",
            location: "Market Street",
          },
          { time: "Noon", title: "Magna Aliqua Ut", location: "Market Street" },
          {
            time: "Noon–9 p.m.",
            title: "Enim Ad Minim",
            location: "East Green",
          },
          {
            time: "12:45 p.m.",
            title: "Veniam Quis Nostrud",
            location: "North Plaza",
          },
          {
            time: "1:00 p.m.–5:00 p.m.",
            title: "Lorem Ipsum Dolor",
            location: "Town Square",
          },
          {
            time: "1:30 p.m.",
            title: "Exercitation Ullamco",
            location: "North Plaza",
          },
          {
            time: "2:00 p.m.–5:00 p.m.",
            title: "Laboris Nisi Aliquip",
            location: "Central Plaza",
          },
          { time: "2:30 p.m.", title: "Sit Amet Consectetur" },
          {
            time: "3:00 p.m.",
            title: "Ex Ea Commodo",
            location: "River Walk",
          },
          {
            time: "4:00 p.m.",
            title: "Consequat Duis Aute",
            location: "Main Lawn",
          },
          {
            time: "4:45 p.m.",
            title: "Veniam Quis Nostrud",
            location: "North Plaza",
          },
          {
            time: "5:00 p.m.",
            title: "Irure Dolor",
            location: "Market Street",
          },
          {
            time: "5:30 p.m.",
            title: "Exercitation Ullamco",
            location: "North Plaza",
          },
          {
            time: "6:30 p.m.",
            title: "Reprehenderit Voluptate",
            location: "Central Plaza",
          },
          { time: "9:00 p.m.", title: "Retail Shops Close" },
          { time: "9:45 p.m.", title: "Shuttles End" },
        ],
      },
      {
        name: "Main Stage",
        events: [
          { time: "10:15 a.m.", title: "Cillum Dolore Eu" },
          { time: "11:15 a.m.", title: "Fugiat Nulla Pariatur" },
          { time: "12:45 p.m.", title: "Excepteur Sint Occaecat" },
          { time: "1:45 p.m.", title: "Cillum Dolore Eu" },
          { time: "2:30 p.m.", title: "Excepteur Sint Occaecat" },
          { time: "3:30 p.m.", title: "Cillum Dolore Eu" },
          { time: "4:30 p.m.", title: "Fugiat Nulla Pariatur" },
        ],
      },
      {
        name: "Second Stage",
        events: [
          { time: "10:00 a.m.", title: "Cupidatat Non Proident" },
          { time: "11:00 a.m.", title: "Sunt Culpa Qui" },
          { time: "11:30 a.m.", title: "Officia Deserunt Mollit" },
          { time: "Noon", title: "Anim Id Est" },
          { time: "1:00 p.m.", title: "Laborum Perspiciatis Unde" },
          { time: "2:00 p.m.", title: "Anim Id Est" },
          { time: "Various Afternoon Times", title: "Omnis Iste Natus" },
        ],
      },
    ],
  },
  {
    day: "Sunday",
    stages: [
      {
        events: [
          { time: "9:00 a.m.", title: "Festival Opens" },
          {
            time: "9:00 a.m.–5:00 p.m.",
            title: "Lorem Ipsum Dolor",
            location: "Town Square",
          },
          { time: "9:30 a.m.", title: "Sit Amet Consectetur" },
          {
            time: "9:30 a.m.–1:00 p.m.",
            title: "Tempor Incididunt",
            location: "River Walk",
          },
          {
            time: "10:00 a.m.–4:00 p.m.",
            title: "Merch Table & Refreshment Tent Open",
          },
          {
            time: "10:00 a.m.",
            title: "Cillum Dolore Eu",
            location: "Main Lawn",
          },
          {
            time: "Noon–2:00 p.m.",
            title: "Excepteur Sint Occaecat",
            location: "Main Lawn",
          },
          { time: "2:30 p.m.", title: "Sit Amet Consectetur" },
          {
            time: "2:45 p.m.",
            title: "Veniam Quis Nostrud",
            location: "North Plaza",
          },
          {
            time: "3:30 p.m.",
            title: "Exercitation Ullamco",
            location: "North Plaza",
          },
          { time: "5:00 p.m.", title: "Festival Concludes" },
        ],
      },
      {
        name: "Main Stage",
        events: [
          { time: "10:00 a.m.", title: "Error Voluptatem Accusantium" },
          { time: "11:00 a.m.", title: "Fugiat Nulla Pariatur" },
          { time: "1:00 p.m.", title: "Error Voluptatem Accusantium" },
          { time: "2:00 p.m.", title: "Cillum Dolore Eu" },
          { time: "4:00 p.m.", title: "Error Voluptatem Accusantium" },
        ],
      },
      {
        name: "Second Stage",
        events: [
          { time: "Noon", title: "Cillum Dolore Eu" },
          {
            time: "2:00 p.m.–4:00 p.m.",
            title: "Doloribus Asperiores Repellat",
          },
        ],
      },
    ],
  },
];

export interface FestivalService {
  name: string;
  detail: string;
}

export const festivalServices: FestivalService[] = [
  {
    name: "Restrooms",
    detail: "Behind the North Plaza — between Market Street and Central Plaza",
  },
  { name: "Water Filling Station", detail: "Central Plaza" },
  {
    name: "Nursing/Changing Room",
    detail: "Town Square & East Green",
  },
  {
    name: "Information Booth",
    detail: "Town Square Saturday & Sunday | River Walk Saturday only",
  },
  {
    name: "Volunteer & Nonprofit Alley",
    detail: "Featuring local organizations — Market Street",
  },
];
