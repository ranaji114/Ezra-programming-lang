import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Linking } from 'react-native';
import { COLORS, SPACING, RADIUS } from '../theme';
import { CHAPTERS } from '../data/chapters';

export default function HomeScreen({ navigation }) {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.logoRow}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>E</Text>
          </View>
          <View>
            <Text style={styles.heroTitle}>Ezra Language</Text>
            <Text style={styles.heroSub}>Learn to code the readable way</Text>
          </View>
        </View>
        <Text style={styles.heroDesc}>
          Ezra is a scripting language built in Rust with natural, English-like syntax.
          This app teaches you everything from basics to advanced — chapter by chapter.
        </Text>
        <View style={styles.heroButtons}>
          <TouchableOpacity style={styles.btnPrimary} onPress={() => navigation.navigate('Chapter', { chapterId: 1 })}>
            <Text style={styles.btnPrimaryText}>Start Learning →</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnOutline} onPress={() => navigation.navigate('Playground')}>
            <Text style={styles.btnOutlineText}>▶ Playground</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        {[['14', 'Chapters'], ['100%', 'Offline'], ['Free', 'Always'], ['v1.0', 'Version']].map(([val, label]) => (
          <View key={label} style={styles.statItem}>
            <Text style={styles.statVal}>{val}</Text>
            <Text style={styles.statLabel}>{label}</Text>
          </View>
        ))}
      </View>

      {/* Chapters list */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>All Chapters</Text>
        {CHAPTERS.map((ch, i) => (
          <TouchableOpacity
            key={ch.id}
            style={styles.chapterCard}
            onPress={() => navigation.navigate('Chapter', { chapterId: ch.id })}
            activeOpacity={0.75}
          >
            <Text style={styles.chIcon}>{ch.icon}</Text>
            <View style={styles.chInfo}>
              <View style={styles.chTop}>
                <Text style={styles.chNum}>Chapter {ch.id}</Text>
              </View>
              <Text style={styles.chTitle}>{ch.title}</Text>
              <Text style={styles.chSub}>{ch.subtitle}</Text>
            </View>
            <Text style={styles.chArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* GitHub link */}
      <TouchableOpacity style={styles.ghLink} onPress={() => Linking.openURL('https://github.com/ranaji114/Ezra-programming-lang')}>
        <Text style={styles.ghText}>⭐ Star on GitHub</Text>
      </TouchableOpacity>

      <View style={{ height: SPACING.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  hero: { backgroundColor: COLORS.brandBg, borderBottomWidth: 1, borderBottomColor: COLORS.brandBorder, padding: SPACING.lg, paddingTop: SPACING.xl },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.md },
  logoBox: { width: 48, height: 48, borderRadius: RADIUS.lg, backgroundColor: COLORS.brand, alignItems: 'center', justifyContent: 'center' },
  logoText: { color: '#fff', fontWeight: '900', fontSize: 22, fontFamily: 'Courier New' },
  heroTitle: { fontSize: 22, fontWeight: '800', color: COLORS.text },
  heroSub: { fontSize: 13, color: COLORS.brand, fontWeight: '600', marginTop: 2 },
  heroDesc: { fontSize: 14, color: COLORS.text2, lineHeight: 22, marginBottom: SPACING.md },
  heroButtons: { flexDirection: 'row', gap: SPACING.sm, flexWrap: 'wrap' },
  btnPrimary: { backgroundColor: COLORS.brand, paddingVertical: 10, paddingHorizontal: 20, borderRadius: RADIUS.md },
  btnPrimaryText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  btnOutline: { borderWidth: 1.5, borderColor: COLORS.brand, paddingVertical: 10, paddingHorizontal: 20, borderRadius: RADIUS.md },
  btnOutlineText: { color: COLORS.brand, fontWeight: '700', fontSize: 14 },
  statsRow: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: COLORS.border, padding: SPACING.md },
  statItem: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 18, fontWeight: '800', color: COLORS.brand },
  statLabel: { fontSize: 11, color: COLORS.text3, marginTop: 2 },
  section: { padding: SPACING.md, paddingTop: SPACING.lg },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },
  chapterCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, gap: SPACING.sm },
  chIcon: { fontSize: 28, width: 40, textAlign: 'center' },
  chInfo: { flex: 1 },
  chTop: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginBottom: 2 },
  chNum: { fontSize: 11, color: COLORS.brand, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  chTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  chSub: { fontSize: 12, color: COLORS.text3, marginTop: 2 },
  chArrow: { fontSize: 22, color: COLORS.brand, fontWeight: '700' },
  ghLink: { margin: SPACING.md, padding: SPACING.md, backgroundColor: COLORS.bgAlt, borderRadius: RADIUS.lg, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  ghText: { color: COLORS.text2, fontWeight: '600', fontSize: 14 },
});
