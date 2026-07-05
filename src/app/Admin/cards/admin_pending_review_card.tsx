import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { MockPendingReview } from '@/constants/adminMockData';

interface PendingReviewCardProps {
	review: MockPendingReview;
	onReview: (review: MockPendingReview) => void;
}

export default function PendingReviewCard({ review, onReview }: PendingReviewCardProps) {
	return (
		<View style={styles.row}>
			<View style={styles.accent} />

			<View style={styles.info}>
				<Text style={styles.caseCode}>{review.caseCode}</Text>
				<Text style={styles.meta}>{review.examiner} · {review.dateLabel}</Text>
				<Text style={styles.verdict}>{review.verdictLabel} · {review.confidence.toFixed(1)}%</Text>
			</View>

			<TouchableOpacity style={styles.button} onPress={() => onReview(review)} activeOpacity={0.85}>
				<Text style={styles.buttonText}>Review</Text>
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
		backgroundColor: '#FFFFFF',
		borderRadius: 14,
		borderWidth: 1,
		borderColor: '#E3EAF3',
		paddingVertical: 12,
		paddingHorizontal: 14,
		overflow: 'hidden',
	},
	accent: {
        position: 'absolute',
		left: 13,
		top: 12,
		bottom: 12,
		width: 3,
		borderRadius: 999,
		backgroundColor: '#1E6FD9',
		
	},
	info: {
		flex: 1,
		paddingLeft: 6,
        left: 6,
	},
	caseCode: {
		color: '#0F172A',
		fontSize: 13,
		fontWeight: '800',
	},
	meta: {
		color: '#94A3B8',
		fontSize: 11,
		fontWeight: '600',
		marginTop: 2,
	},
	verdict: {
		color: '#1E6FD9',
		fontSize: 11,
		fontWeight: '700',
		marginTop: 2,
	},
	button: {
		backgroundColor: '#EAF3FF',
		borderRadius: 999,
		paddingHorizontal: 14,
		paddingVertical: 8,
	},
	buttonText: {
		color: '#1E6FD9',
		fontSize: 12,
		fontWeight: '800',
	},
});