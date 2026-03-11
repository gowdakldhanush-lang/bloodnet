function DonorCard({ donor }) {
    const initials = donor.name
        ? donor.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
        : '??';

    return (
        <div className="card donor-card card-hover fade-in">
            <div className="donor-avatar">{initials}</div>
            <div className="donor-info">
                <div className="donor-name">{donor.name}</div>
                <div className="donor-meta">
                    {donor.phone} • {donor.gender}
                </div>
            </div>
            <span className="blood-badge">{donor.bloodType}</span>
            {donor.distance !== undefined && (
                <span className="donor-distance">{donor.distance} km</span>
            )}
        </div>
    );
}

export default DonorCard;
