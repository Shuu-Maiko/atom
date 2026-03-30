export interface Vessel {
  mmsi: string;
  name: string;
  callsign: string;
  country: string;
  longitude: number;
  latitude: number;
  speed: number;
  course: number;
  heading: number;
  status: string;
  shipType: string;
  destination: string;
  eta: string;
  length: number;
  width: number;
  draft: number;
  cargoType: string;
}

export interface VesselData {
  vessels: Vessel[];
  fetchedAt: string;
  source: string;
}

export const SAMPLE_VESSELS: Vessel[] = [
  {
    mmsi: "310627000",
    name: "EVER GIVEN",
    callsign: "3EBT7",
    country: "Panama",
    longitude: 32.3333,
    latitude: 30.0333,
    speed: 12.5,
    course: 45,
    heading: 45,
    status: "Underway",
    shipType: "Container Ship",
    destination: "Rotterdam",
    eta: "2024-04-15",
    length: 400,
    width: 59,
    draft: 14.5,
    cargoType: "Containers"
  },
  {
    mmsi: "366952000",
    name: "USS GERALD R FORD",
    callsign: "NGBF",
    country: "USA",
    longitude: -76.3333,
    latitude: 36.95,
    speed: 18.0,
    course: 90,
    heading: 90,
    status: "Underway",
    shipType: "Aircraft Carrier",
    destination: "Norfolk",
    eta: "2024-03-30",
    length: 337,
    width: 78,
    draft: 12.0,
    cargoType: "Military"
  },
  {
    mmsi: "413764000",
    name: "COSCO SHANGHAI",
    callsign: "BOPU",
    country: "China",
    longitude: 121.47,
    latitude: 31.23,
    speed: 15.2,
    course: 180,
    heading: 180,
    status: "Underway",
    shipType: "Container Ship",
    destination: "Shanghai",
    eta: "2024-03-28",
    length: 366,
    width: 51,
    draft: 13.5,
    cargoType: "Containers"
  },
  {
    mmsi: "235000001",
    name: "HMS QUEEN ELIZABETH",
    callsign: "GQLZ",
    country: "UK",
    longitude: -4.5,
    latitude: 56.0,
    speed: 20.0,
    course: 270,
    heading: 270,
    status: "Underway",
    shipType: "Aircraft Carrier",
    destination: "Portsmouth",
    eta: "2024-04-01",
    length: 284,
    width: 73,
    draft: 11.0,
    cargoType: "Military"
  },
  {
    mmsi: "273514000",
    name: "ADMIRAL KUZNETSOV",
    callsign: "UCFM",
    country: "Russia",
    longitude: 33.5,
    latitude: 69.2,
    speed: 8.0,
    course: 135,
    heading: 135,
    status: "At Anchor",
    shipType: "Aircraft Carrier",
    destination: "Murmansk",
    eta: "2024-04-10",
    length: 305,
    width: 72,
    draft: 10.5,
    cargoType: "Military"
  },
  {
    mmsi: "431000001",
    name: "JS IZUMO",
    callsign: "JSTX",
    country: "Japan",
    longitude: 139.7,
    latitude: 35.6,
    speed: 16.0,
    course: 0,
    heading: 0,
    status: "Underway",
    shipType: "Helicopter Carrier",
    destination: "Yokosuka",
    eta: "2024-03-29",
    length: 248,
    width: 38,
    draft: 7.5,
    cargoType: "Military"
  },
  {
    mmsi: "503000001",
    name: "HMAS CANBERRA",
    callsign: "VKJC",
    country: "Australia",
    longitude: 151.2,
    latitude: -33.8,
    speed: 14.0,
    course: 315,
    heading: 315,
    status: "Underway",
    shipType: "Amphibious Assault Ship",
    destination: "Sydney",
    eta: "2024-04-05",
    length: 230,
    width: 32,
    draft: 7.0,
    cargoType: "Military"
  },
  {
    mmsi: "228000001",
    name: "FS CHARLES DE GAULLE",
    callsign: "FNAE",
    country: "France",
    longitude: -4.5,
    latitude: 48.4,
    speed: 22.0,
    course: 225,
    heading: 225,
    status: "Underway",
    shipType: "Aircraft Carrier",
    destination: "Toulon",
    eta: "2024-04-02",
    length: 261,
    width: 64,
    draft: 9.4,
    cargoType: "Military"
  },
  {
    mmsi: "247000001",
    name: "CAVOUR",
    callsign: "IAMC",
    country: "Italy",
    longitude: 9.8,
    latitude: 44.1,
    speed: 17.0,
    course: 45,
    heading: 45,
    status: "Underway",
    shipType: "Aircraft Carrier",
    destination: "Taranto",
    eta: "2024-04-03",
    length: 244,
    width: 39,
    draft: 8.7,
    cargoType: "Military"
  },
  {
    mmsi: "419000001",
    name: "INS VIKRANT",
    callsign: "AVTV",
    country: "India",
    longitude: 72.8,
    latitude: 18.9,
    speed: 19.0,
    course: 135,
    heading: 135,
    status: "Underway",
    shipType: "Aircraft Carrier",
    destination: "Mumbai",
    eta: "2024-04-04",
    length: 262,
    width: 62,
    draft: 8.4,
    cargoType: "Military"
  },
  {
    mmsi: "416000001",
    name: "ROKS DOKDO",
    callsign: "DTMA",
    country: "South Korea",
    longitude: 126.9,
    latitude: 37.5,
    speed: 21.0,
    course: 90,
    heading: 90,
    status: "Underway",
    shipType: "Amphibious Assault Ship",
    destination: "Busan",
    eta: "2024-04-06",
    length: 199,
    width: 31,
    draft: 7.0,
    cargoType: "Military"
  },
  {
    mmsi: "563000001",
    name: "RSS ENDURANCE",
    callsign: "S6KW",
    country: "Singapore",
    longitude: 103.8,
    latitude: 1.3,
    speed: 13.0,
    course: 270,
    heading: 270,
    status: "Underway",
    shipType: "Landing Ship Tank",
    destination: "Changi",
    eta: "2024-04-07",
    length: 141,
    width: 20,
    draft: 5.0,
    cargoType: "Military"
  }
];
