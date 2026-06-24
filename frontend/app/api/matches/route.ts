import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Cricket matches from CricAPI
    const cricRes = await fetch(
      `https://api.cricapi.com/v1/currentMatches?apikey=${process.env.NEXT_PUBLIC_CRICAPI_KEY}&offset=0`,
      { next: { revalidate: 120 } }
    );
    const cricData = await cricRes.json();

    // Football from free public API (no key needed)
    const today = new Date().toISOString().split("T")[0];
    const footRes = await fetch(
      `https://www.scorebat.com/video-api/v3/feed/?token=`,
      { next: { revalidate: 300 } }
    );

    const matches = [];

    // Process cricket matches
    if (cricData?.data) {
      for (const match of cricData.data.slice(0, 8)) {
        const isLive = match.matchStarted && !match.matchEnded;
        const team1 = match.teams?.[0] || "TBD";
        const team2 = match.teams?.[1] || "TBD";

        matches.push({
          id: match.id,
          title: `${team1} vs ${team2}`,
          category: match.name?.includes("IPL") ? "IPL" :
                    match.name?.includes("T20") ? "T20" :
                    match.name?.includes("ODI") ? "ODI" : "Cricket",
          sport: "cricket",
          status: isLive ? "LIVE" :
                  match.matchEnded ? "Ended" :
                  match.dateTimeGMT ? new Date(match.dateTimeGMT).toLocaleTimeString("en-US", {
                    hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kathmandu"
                  }) : "Upcoming",
          team1, team2,
          team1Logo: getTeamLogo(team1),
          team2Logo: getTeamLogo(team2),
          score: match.score || [],
          venue: match.venue || "",
          isLive,
          url: "/chill-zone",
          color: isLive ? "from-red-500/25 to-orange-500/15" : "from-white/5 to-white/3",
        });
      }
    }

    // Add static football matches (EPL, UCL)
    const footballMatches = [
      {
        id: "epl-1", title: "Premier League", category: "EPL", sport: "football",
        status: "Weekend", team1: "Arsenal", team2: "Man City",
        team1Logo: "https://upload.wikimedia.org/wikipedia/en/thumb/5/53/Arsenal_FC.svg/1200px-Arsenal_FC.svg.png",
        team2Logo: "https://upload.wikimedia.org/wikipedia/en/thumb/e/eb/Manchester_City_FC_badge.svg/1200px-Manchester_City_FC_badge.svg.png",
        score: [], venue: "Emirates Stadium", isLive: false, url: "/chill-zone",
        color: "from-red-500/15 to-blue-500/15",
      },
      {
        id: "ucl-1", title: "Champions League", category: "UCL", sport: "football",
        status: "Tue 12:30 AM", team1: "Real Madrid", team2: "Bayern",
        team1Logo: "https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/1200px-Real_Madrid_CF.svg.png",
        team2Logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg/1200px-FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg.png",
        score: [], venue: "Santiago Bernabeu", isLive: false, url: "/chill-zone",
        color: "from-white/8 to-blue-500/10",
      },
    ];

    return NextResponse.json({
      matches: [...matches, ...footballMatches],
      updated: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Matches API error:", err);
    return NextResponse.json({ matches: [], error: "Failed" }, { status: 500 });
  }
}

// Team logo helper
function getTeamLogo(team: string): string {
  const logos: Record<string, string> = {
    "Mumbai Indians":       "https://upload.wikimedia.org/wikipedia/en/thumb/c/cd/Mumbai_Indians_Logo.svg/1200px-Mumbai_Indians_Logo.svg.png",
    "Chennai Super Kings":  "https://upload.wikimedia.org/wikipedia/en/thumb/2/2b/Chennai_Super_Kings_Logo.svg/1200px-Chennai_Super_Kings_Logo.svg.png",
    "Royal Challengers Bengaluru": "https://upload.wikimedia.org/wikipedia/en/thumb/2/2a/Royal_Challengers_Bengaluru_Logo.svg/1200px-Royal_Challengers_Bengaluru_Logo.svg.png",
    "Kolkata Knight Riders": "https://upload.wikimedia.org/wikipedia/en/thumb/4/4c/Kolkata_Knight_Riders_Logo.svg/1200px-Kolkata_Knight_Riders_Logo.svg.png",
    "Delhi Capitals":       "https://upload.wikimedia.org/wikipedia/en/thumb/f/f5/Delhi_Capitals_Logo.svg/1200px-Delhi_Capitals_Logo.svg.png",
    "Punjab Kings":         "https://upload.wikimedia.org/wikipedia/en/thumb/d/d4/Punjab_Kings_Logo.svg/1200px-Punjab_Kings_Logo.svg.png",
    "Rajasthan Royals":     "https://upload.wikimedia.org/wikipedia/en/thumb/5/5c/This_is_the_logo_for_Rajasthan_Royals.png/1280px-This_is_the_logo_for_Rajasthan_Royals.png",
    "Sunrisers Hyderabad":  "https://upload.wikimedia.org/wikipedia/en/thumb/8/81/Sunrisers_Hyderabad.svg/1200px-Sunrisers_Hyderabad.svg.png",
    "Gujarat Titans":       "https://upload.wikimedia.org/wikipedia/en/thumb/0/09/Gujarat_Titans_Logo.svg/1200px-Gujarat_Titans_Logo.svg.png",
    "Lucknow Super Giants": "https://upload.wikimedia.org/wikipedia/en/thumb/l/l7/Lucknow_Super_Giants_Logo.svg/1200px-Lucknow_Super_Giants_Logo.svg.png",
    "India":   "https://upload.wikimedia.org/wikipedia/en/thumb/4/41/Flag_of_India.svg/1200px-Flag_of_India.svg.png",
    "Pakistan": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Flag_of_Pakistan.svg/1200px-Flag_of_Pakistan.svg.png",
    "Australia": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Flag_of_Australia_%28converted%29.svg/1200px-Flag_of_Australia_%28converted%29.svg.png",
    "England":  "https://upload.wikimedia.org/wikipedia/en/thumb/b/be/Flag_of_England.svg/1200px-Flag_of_England.svg.png",
  };
  return logos[team] || `https://ui-avatars.com/api/?name=${encodeURIComponent(team)}&background=1e293b&color=fff&size=80`;
}