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
          { time: "9:00 a.m.", title: "Festival Opens" },
          {
            time: "10:00 a.m.–6:00 p.m.",
            title: "Merch Table & Refreshment Tent Open",
          },
          { time: "Noon", title: "Lorem Ipsum Dolor", location: "Town Square" },
          { time: "9:00 p.m.", title: "Festival Closes" },
        ],
      },
      {
        name: "Main Stage",
        events: [
          { time: "11:00 a.m.", title: "Cillum Dolore Eu" },
          { time: "2:00 p.m.", title: "Excepteur Sint Occaecat" },
          { time: "4:30 p.m.", title: "Fugiat Nulla Pariatur" },
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
