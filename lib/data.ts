// /lib/data.ts
import { MdCheckCircle, MdWarning, MdError } from "react-icons/md";

export interface CarData {
  id: string;
  model: string;
  type: string;
  regestrationNumber: string;
  location: string;
  pricePerDay: number;
  status: "available" | "rented" | "maintenance";
  image: string;
  year: number;
  transmission: string;
  fuel: string;
  seats: number;
}

export const mockCars: CarData[] = [
  {
    id: "CAR001",
    model: "Toyota Land Cruiser",
    type: "SUV",
    regestrationNumber: "KBS 123A",
    location: "Westlands, Nairobi",
    pricePerDay: 12000,
    status: "available",
    image: "",
    year: 2022,
    transmission: "Automatic",
    fuel: "Diesel",
    seats: 7
  },
  {
    id: "CAR002", 
    model: "Subaru Outback",
    type: "SUV",
    regestrationNumber: "KCD 456B",
    location: "Karen, Nairobi",
    pricePerDay: 8000,
    status: "rented",
    image: "",
    year: 2021,
    transmission: "Automatic",
    fuel: "Petrol",
    seats: 5
  },
  {
    id: "CAR003",
    model: "Toyota Corolla", 
    type: "Sedan",
    regestrationNumber: "KDF 789C",
    location: "CBD, Nairobi",
    pricePerDay: 4500,
    status: "available",
    image: "",
    year: 2023,
    transmission: "Automatic",
    fuel: "Petrol",
    seats: 5
  },
  {
    id: "CAR004",
    model: "Nissan NV350",
    type: "Van",
    regestrationNumber: "KGH 012D",
    location: "Kilimani, Nairobi",
    pricePerDay: 10000,
    status: "maintenance",
    image: "",
    year: 2020,
    transmission: "Manual",
    fuel: "Diesel",
    seats: 12
  },
];

export const statusConfig = {
  available: { icon: MdCheckCircle, color: "bg-success text-light", label: "Available" },
  rented: { icon: MdWarning, color: "bg-warning text-dark", label: "Rented" },
  maintenance: { icon: MdError, color: "bg-danger text-light", label: "Maintenance" },
};