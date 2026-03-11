import emailjs from '@emailjs/browser';

const EMAILJS_SERVICE_ID = 'service_qyf21l2';
const EMAILJS_TEMPLATE_ID = 'template_oa33k7e';
const EMAILJS_PUBLIC_KEY = 'Y0EGzQtmuebbrZoKL';

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
