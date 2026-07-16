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

// Placeholder preview of last year's schedule — swap this array for the 2026 lineup once
// the client publishes it; ScheduleTimeline.astro only needs this data to change.
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
            title: "Character Meet and Greets",
            location: "103 W. Beverley, 110 W. Beverley, 35A South New Street",
          },
          { time: "9:30 a.m.", title: "Buckingham Branch Train Arrival" },
          {
            time: "10:00 a.m.–7:00 p.m.",
            title: "QCMM Merch Table & Butter Brew Tent Open",
          },
          {
            time: "10:00 a.m.–3:00 p.m.",
            title: "Dance like Professor G!",
            location: "Corner of Central and Beverley",
          },
          { time: "10:00 a.m.–5:30 p.m.", title: "Sorting", location: "Wharf" },
          {
            time: "10:00 a.m.–6:00 p.m.",
            title: "Low Flying Owls",
            location: "Beverley",
          },
          { time: "Noon", title: "Polyjuice Parade", location: "Beverley" },
          {
            time: "Noon–9 p.m.",
            title: "Knockturn Alley Open for Mature Wizards",
            location: "Beverley/Augusta St",
          },
          {
            time: "12:45 p.m.",
            title: "Quidditch Training",
            location: "Johnson Street",
          },
          {
            time: "1:00 p.m.–5:00 p.m.",
            title: "Character Meet and Greets",
            location: "103 W. Beverley, 110 W. Beverley, 35A S. New Street",
          },
          {
            time: "1:30 p.m.",
            title: "Quidditch Match",
            location: "Johnson Street",
          },
          {
            time: "2:00 p.m.–5:00 p.m.",
            title: "Magic Plant Demonstration by Bloomaker",
            location: "Greenhouse on Beverley",
          },
          { time: "2:30 p.m.", title: "Buckingham Branch Train Arrival" },
          {
            time: "3:00 p.m.",
            title: "Quackkitch World Cup",
            location: "S. Central Ave",
          },
          {
            time: "4:00 p.m.",
            title: "Weasley Wedding Reception",
            location: "You Belong Here Mural",
          },
          {
            time: "4:45 p.m.",
            title: "Quidditch Training",
            location: "Johnson Street",
          },
          {
            time: "5:00 p.m.",
            title: "Meet the Weasleys",
            location: "110 W. Beverley",
          },
          {
            time: "5:30 p.m.",
            title: "Quidditch Match",
            location: "Johnson Street",
          },
          {
            time: "6:30 p.m.",
            title: "Dementor Dance Party",
            location: "Hufflepuff Block/Beverley Street",
          },
          { time: "9:00 p.m.", title: "Retail Shops Close" },
          { time: "9:45 p.m.", title: "Shuttles End" },
        ],
      },
      {
        name: "SunSpots Stage",
        events: [
          { time: "10:15 a.m.", title: "Vick the Illusionist" },
          { time: "11:15 a.m.", title: "Sssslytherin Sssssnake Ssssshow" },
          { time: "12:45 p.m.", title: "Critters and Their Stories" },
          { time: "1:45 p.m.", title: "Vick the Illusionist" },
          { time: "2:30 p.m.", title: "Critters and Their Stories" },
          { time: "3:30 p.m.", title: "Vick the Illusionist" },
          { time: "4:30 p.m.", title: "Sssslytherin Sssssnake Ssssshow" },
        ],
      },
      {
        name: "Ravenclaw Stage",
        events: [
          { time: "10:00 a.m.", title: "Sorting Hat Ceremony" },
          { time: "11:00 a.m.", title: "Goblet of Fire Ceremony" },
          { time: "11:30 a.m.", title: "Beauxbaton Dance" },
          { time: "Noon", title: "Queen City A Cappella" },
          { time: "1:00 p.m.", title: "Flutes of the Shenandoah" },
          { time: "2:00 p.m.", title: "Queen City A Cappella" },
          { time: "Various Afternoon Times", title: "Time Step Turners" },
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
            title: "Character Meet and Greets",
            location: "103 W. Beverley, 110 W. Beverley, 35A South New Street",
          },
          { time: "9:30 a.m.", title: "Buckingham Branch Train Arrival" },
          { time: "9:30 a.m.–1:00 p.m.", title: "Sorting", location: "Wharf" },
          {
            time: "10:00 a.m.–4:00 p.m.",
            title: "QCMM Merch Table & Butter Brew Tent Open",
          },
          {
            time: "10:00 a.m.",
            title: "Vick the Illusionist",
            location: "You Belong Here Mural",
          },
          {
            time: "Noon–2:00 p.m.",
            title: "Matt Johnson of NBC’s the Voice Performs",
            location: "You Belong Here Mural",
          },
          { time: "2:30 p.m.", title: "Buckingham Branch Train Arrival" },
          {
            time: "2:45 p.m.",
            title: "Quidditch Training",
            location: "Johnson Street",
          },
          {
            time: "3:30 p.m.",
            title: "Quidditch Match",
            location: "Johnson Street",
          },
          { time: "5:00 p.m.", title: "Festival Concludes" },
        ],
      },
      {
        name: "SunSpots Stage",
        events: [
          { time: "10:00 a.m.", title: "Beware of Low Flying Owls" },
          { time: "11:00 a.m.", title: "Sssslytherin Sssssnake Ssssshow" },
          { time: "1:00 p.m.", title: "Beware of Low Flying Owls" },
          { time: "2:00 p.m.", title: "Vick the Illusionist" },
          { time: "4:00 p.m.", title: "Beware of Low Flying Owls" },
        ],
      },
      {
        name: "Ravenclaw Stage",
        events: [
          { time: "Noon", title: "Vick the Illusionist" },
          { time: "2:00 p.m.–4:00 p.m.", title: "Nickel Plate Brass Band" },
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
    detail: "Behind SunTrust Bank — Between Augusta St and Central Ave",
  },
  { name: "Water Filling Station", detail: "Ciders from Mars" },
  {
    name: "Nursing/Changing Room",
    detail: "The Frenchman (at Train Station) & CoArt Gallery",
  },
  {
    name: "Information Booth",
    detail: "5 E. Beverley Saturday & Sunday | Wharf Saturday only",
  },
  {
    name: "Do Good Alley",
    detail: "Featuring Non-Profit Organizations — New Location on New Street!",
  },
];
