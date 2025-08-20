import React from "react";

const Rank = ({ name, entries }) => {
    const displayName = name || 'Guest';
    const displayEntries = typeof entries === 'number' ? entries : Number(entries || 0);
    return (
        <div className="white f3">
            {`${displayName}, your current entry count is...`}
            <div className="f1">
                {displayEntries}
            </div>
        </div>
    );
}

export default Rank;