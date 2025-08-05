// components/Modal/BookingModal.tsx
"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { FiCheck, FiX, FiLoader } from "react-icons/fi";

type BookingStatus = "confirmed" | "completed" | "cancelled";

interface Booking {
  _id: string;
  bookingId: string;
  customerInfo: {
    fullName: string;
  };
  status: string;
}

type BookingModalProps = {
  type: BookingStatus;
  id: string;
  data: Booking;
  onSuccess?: () => void;
  children?: React.ReactNode;
};

const statusConfig = {
  confirmed: {
    icon: <FiCheck className="h-5 w-5 text-green-500" />,
    title: "Confirm Booking",
    description: "This will confirm the booking and notify the customer.",
    buttonText: "Confirm Booking",
    buttonClass: "bg-green-600 hover:bg-green-700"
  },
  completed: {
    icon: <FiCheck className="h-5 w-5 text-blue-500" />,
    title: "Complete Booking",
    description: "Mark this booking as completed and release the vehicle.",
    buttonText: "Mark as Completed",
    buttonClass: "bg-blue-600 hover:bg-blue-700"
  },
  cancelled: {
    icon: <FiX className="h-5 w-5 text-red-500" />,
    title: "Cancel Booking",
    description: "Cancel this booking and notify the customer.",
    buttonText: "Cancel Booking",
    buttonClass: "bg-red-600 hover:bg-red-700"
  }
};

const BookingModal: React.FC<BookingModalProps> = ({ 
  type,
  id,
  data,
  onSuccess,
  children 
}) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleStatusUpdate = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/booking/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: type }),
      });

      if (res.ok) {
        toast.success(`Booking ${type} successfully`);
        onSuccess?.();
        setOpen(false);
      } else {
        const result = await res.json();
        toast.error(`Update failed: ${result.error || "Unknown error"}`);
      }
    } catch (err) {
      toast.error("An error occurred while updating the booking");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Trigger button */}
      <div onClick={() => setOpen(true)}>
        {children}
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 bg-dark/80 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-light rounded-xl shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center border-b border-secondary-dark p-4">
              <h3 className="text-xl font-bold text-dark">
                {statusConfig[type].title}
              </h3>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close modal"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Booking ID:</p>
                <p className="font-medium text-dark">{data.bookingId}</p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Customer:</p>
                <p className="font-medium text-dark">{data.customerInfo.fullName}</p>
              </div>
              
              <div className="space-y-4">
                <p className="text-sm text-gray-600">Current Status:</p>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    data.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    data.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    data.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {data.status.charAt(0).toUpperCase() + data.status.slice(1)}
                  </span>
                  <span className="text-gray-500">→</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    type === 'confirmed' ? 'bg-green-100 text-green-800' :
                    type === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {statusConfig[type].description}
                </p>
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 border border-secondary-dark rounded-lg text-dark hover:bg-secondary/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStatusUpdate}
                  disabled={isLoading}
                  className={`px-4 py-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 ${statusConfig[type].buttonClass}`}
                >
                  {isLoading && <FiLoader className="animate-spin h-4 w-4" />}
                  {statusConfig[type].buttonText}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BookingModal;