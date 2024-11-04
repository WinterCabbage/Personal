let initial = {
	longestQueryTime: 0,
	longestQueryDomain: "",
	totalQueryTime: 0,
	numberOfQuery: 0,
	lastProcessedTime: {} // Track only the last processed timestamp per domain
};

let history = JSON.parse(
	$persistentStore.read("DnsQueryTime") || JSON.stringify(initial)
);

$httpAPI("GET", "/v1/dns", null, (body) => {
	body.dnsCache?.forEach((dnsCache) => {
		let domain = dnsCache.domain;
		let timeCost = dnsCache.timeCost;
		let expiresTime = dnsCache.expiresTime;

		// Check if this domain has a recorded timestamp and if the current one is newer
		if (history.lastProcessedTime[domain] >= expiresTime) return;

		// Update with the new timestamp for this domain
		history.lastProcessedTime[domain] = expiresTime;

		// Update longest query time if this is the longest so far
		if (timeCost > history.longestQueryTime) {
			history.longestQueryTime = timeCost;
			history.longestQueryDomain = domain;
		}

		// Accumulate query time and count only if this is a new unique query
		history.totalQueryTime += timeCost;
		history.numberOfQuery += 1;
	});

	// Save updated aggregated data back to persistent storage
	$persistentStore.write(JSON.stringify(history), "DnsQueryTime");

	// Calculate the average query time
	let averageQueryTime = (
		(history.totalQueryTime * 1000) / history.numberOfQuery
	).toFixed(2);

	// Display results
	$done({
		title: "DNS Query Time",
		content: `Count: ${history.numberOfQuery}\nAverage: ${averageQueryTime} ms\nLongest Query: ${history.longestQueryDomain} ${history.longestQueryTime}`,
		icon: "bolt.horizontal.circle.fill",
	});
});

