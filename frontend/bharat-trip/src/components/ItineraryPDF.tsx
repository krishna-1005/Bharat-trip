import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';

// Register fonts if needed, or use standard ones
// Font.register({ family: 'Inter', src: '...' });

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#059669',
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  metaContainer: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 10,
  },
  metaItem: {
    fontSize: 10,
    color: '#475569',
  },
  dayContainer: {
    marginTop: 20,
    marginBottom: 10,
  },
  dayHeader: {
    backgroundColor: '#f1f5f9',
    padding: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dayBadge: {
    backgroundColor: '#059669',
    color: '#ffffff',
    padding: '4 8',
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 'bold',
  },
  dayTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  activityItem: {
    marginLeft: 20,
    paddingLeft: 20,
    borderLeftWidth: 1,
    borderLeftColor: '#e2e8f0',
    borderLeftStyle: 'dashed',
    paddingVertical: 10,
    position: 'relative',
  },
  time: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 2,
  },
  placeName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  description: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
    lineHeight: 1.4,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 9,
    color: '#94a3b8',
  }
});

interface ItineraryPDFProps {
  plan: any;
}

export const ItineraryPDF = ({ plan }: ItineraryPDFProps) => {
  const itinerary = plan?.itinerary || [];
  const title = plan?.title || `${plan?.destination || plan?.city || 'India'} Plan`;
  const days = plan?.days || itinerary.length;
  const budget = plan?.totalBudget || plan?.budget || 0;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.subtitle}>AI-Generated Travel Plan</Text>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.metaContainer}>
            <Text style={styles.metaItem}>{days} Days</Text>
            <Text style={styles.metaItem}>{plan?.destination || plan?.city || 'India'}</Text>
            <Text style={styles.metaItem}>₹{budget.toLocaleString('en-IN')} / person</Text>
          </View>
        </View>

        {itinerary.map((day: any, idx: number) => (
          <View key={idx} style={styles.dayContainer} wrap={false}>
            <View style={styles.dayHeader}>
              <View style={styles.dayBadge}>
                <Text>Day {day.day || idx + 1}</Text>
              </View>
              <Text style={styles.dayTitle}>{day.title || day.theme || 'Exploration'}</Text>
            </View>

            {(day.places || day.items || day.activities || []).map((activity: any, aIdx: number) => (
              <View key={aIdx} style={styles.activityItem}>
                <Text style={styles.time}>{activity.time || 'Scheduled'}</Text>
                <Text style={styles.placeName}>{activity.name || activity.place || activity.activity}</Text>
                <Text style={styles.description}>
                  {activity.desc || activity.description || activity.tag || ''}
                </Text>
              </View>
            ))}
          </View>
        ))}

        <Text style={styles.footer} render={({ pageNumber, totalPages }) => (
          `GoTripo - Your AI Travel Companion  |  Page ${pageNumber} of ${totalPages}`
        )} fixed />
      </Page>
    </Document>
  );
};
