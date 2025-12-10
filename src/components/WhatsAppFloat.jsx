import { MessageCircle } from 'lucide-react';

const WhatsAppFloat = () => {
   
    const phoneNumber = "254700000000";
    const message = "Hello VenueVibe, I need assistance with a booking.";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    return (
        <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 hover:scale-110 transition z-50 flex items-center gap-2"
        >
            <MessageCircle size={24} />
            <span className="hidden md:block font-bold">Chat with us</span>
        </a>
    );
};

export default WhatsAppFloat;