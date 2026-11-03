"use client";

import { useSyncExternalStore } from "react";

type HistoryTimestampProps = {
	date: Date;
};

function formatUtcDateTime(date: Date) {
	return new Intl.DateTimeFormat("en-US", {
		dateStyle: "long",
		timeStyle: "short",
		timeZone: "UTC",
	}).format(date);
}

function formatLocalDateTime(date: Date) {
	return new Intl.DateTimeFormat(undefined, {
		dateStyle: "long",
		timeStyle: "short",
	}).format(date);
}

function subscribe() {
	return () => {};
}

export function HistoryTimestamp({ date }: HistoryTimestampProps) {
	const displayDate = useSyncExternalStore(
		subscribe,
		() => formatLocalDateTime(date),
		() => formatUtcDateTime(date),
	);

	return (
		<time className="mt-1 block text-sm text-slate-600" dateTime={date.toISOString()}>
			{displayDate}
		</time>
	);
}
