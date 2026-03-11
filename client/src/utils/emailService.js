import emailjs from '@emailjs/browser';

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

/**
 * Send email notification to eligible donors
 * @param {Object} request - Blood request details
 * @param {Array} donors - List of eligible donors to notify
 */
export async function notifyDonors(request, donors) {
    if (!donors || donors.length === 0) return;

    const results = [];

    for (const donor of donors) {
        try {
            const templateParams = {
                to_name: donor.name,
                to_email: donor.email,
                blood_type: request.bloodType,
                requester_name: request.requesterName || 'Someone',
                requester_phone: request.requesterPhone || 'N/A',
                urgency: request.urgency || 'Normal',
                distance: donor.distance ? `${donor.distance} km away` : 'Nearby',
                message: `An emergency blood request for ${request.bloodType} blood has been made near your location. You are ${donor.distance ? donor.distance + ' km' : 'close'} from the requester. Please respond as soon as possible.`,
            };

            const response = await emailjs.send(
                EMAILJS_SERVICE_ID,
                EMAILJS_TEMPLATE_ID,
                templateParams,
                EMAILJS_PUBLIC_KEY
            );

            results.push({ donor: donor.name, status: 'sent', response });
        } catch (error) {
            console.error(`Failed to send email to ${donor.name}:`, error);
            results.push({ donor: donor.name, status: 'failed', error });
        }
    }

    return results;
}
