import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking, Alert } from 'react-native';
import { COLORS, SPACING, RADIUS } from '../theme';

export default function SupportScreen() {
  const openEmail = () => {
    const subject = encodeURIComponent('Ezra Language App - Support');
    const body = encodeURIComponent('Hi Ankur,\n\nI have a question/feedback about Ezra:\n\n');
    const url = `mailto:ranaankur442@gmail.com?subject=${subject}&body=${body}`;
    Linking.openURL(url).catch(() => Alert.alert('Error', 'Could not open email client.'));
  };

  const openGitHub = () => Linking.openURL('https://github.com/ranaji114/Ezra-programming-lang');
  const openIssue  = () => Linking.openURL('https://github.com/ranaji114/Ezra-programming-lang/issues/new');

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerIcon}>🤝</Text>
        <Text style={styles.headerTitle}>Support & Contact</Text>
        <Text style={styles.headerSub}>
          Have a question, found a bug, or want to share feedback?
          Ankur Rana — the creator of Ezra — reads every message.
        </Text>
      </View>

      {/* Email CTA */}
      <View style={styles.section}>
        <View style={styles.emailCard}>
          <Text style={styles.emailIcon}>✉️</Text>
          <Text style={styles.emailTitle}>Send an Email</Text>
          <Text style={styles.emailDesc}>
            Click below to open your email app and send a message directly to Ankur.
            Whether it is a question about syntax, a bug report, or a feature idea —
            all feedback is welcome.
          </Text>
          <Text style={styles.emailAddr}>ranaankur442@gmail.com</Text>
          <TouchableOpacity style={styles.emailBtn} onPress={openEmail}>
            <Text style={styles.emailBtnText}>✉ Send Email to Ankur</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* GitHub section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>GitHub</Text>
        <TouchableOpacity style={styles.linkCard} onPress={openGitHub}>
          <View style={styles.linkLeft}>
            <Text style={styles.linkIcon}>⭐</Text>
            <View>
              <Text style={styles.linkTitle}>Star the Repository</Text>
              <Text style={styles.linkSub}>github.com/ranaji114/Ezra-programming-lang</Text>
            </View>
          </View>
          <Text style={styles.linkArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkCard} onPress={openIssue}>
          <View style={styles.linkLeft}>
            <Text style={styles.linkIcon}>🐛</Text>
            <View>
              <Text style={styles.linkTitle}>Report a Bug</Text>
              <Text style={styles.linkSub}>Open a GitHub issue</Text>
            </View>
          </View>
          <Text style={styles.linkArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* FAQ */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>FAQ</Text>
        {[
          {q:'What platforms does Ezra support?', a:'Windows (v1.0), Linux and macOS coming soon. The app works fully offline on Android and iOS.'},
          {q:'Is Ezra free?', a:'Yes. Ezra is completely free and open-source under the MIT license. Always will be.'},
          {q:'How do I report a bug in the language?', a:'Open a GitHub issue or send an email. Include the code that caused the bug and the error message.'},
          {q:'Can I contribute to Ezra?', a:'Absolutely! Check the Contributing guide on GitHub. All kinds of contributions are welcome — code, docs, bug reports, ideas.'},
          {q:'Why is Ezra not on the VS Code Marketplace yet?', a:'It is on the roadmap. For now, install the .vsix file from GitHub Releases.'},
        ].map((item, i) => (
          <View key={i} style={styles.faqItem}>
            <Text style={styles.faqQ}>{item.q}</Text>
            <Text style={styles.faqA}>{item.a}</Text>
          </View>
        ))}
      </View>

      {/* About */}
      <View style={styles.section}>
        <View style={styles.aboutCard}>
          <View style={styles.avatarBox}><Text style={styles.avatarText}>AR</Text></View>
          <Text style={styles.aboutName}>Ankur Rana</Text>
          <Text style={styles.aboutRole}>Creator of Ezra · India</Text>
          <Text style={styles.aboutBio}>
            Ezra is an independent open-source project built by a student fascinated
            by programming language design, compiler theory, and developer tooling.
            Every piece of the language — the lexer, parser, VM, LSP, extension, and
            this app — was built from scratch.
          </Text>
          <TouchableOpacity style={styles.ghBtn} onPress={openGitHub}>
            <Text style={styles.ghBtnText}>github.com/ranaji114 →</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Ezra Language v1.0.0</Text>
        <Text style={styles.footerText}>Created by Ankur Rana · MIT License</Text>
        <Text style={styles.footerText}>ranaankur442@gmail.com</Text>
      </View>

      <View style={{ height: SPACING.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { backgroundColor: COLORS.brandBg, borderBottomWidth: 1, borderBottomColor: COLORS.brandBorder, padding: SPACING.lg, alignItems: 'center' },
  headerIcon: { fontSize: 44, marginBottom: SPACING.sm },
  headerTitle: { fontSize: 24, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.xs },
  headerSub: { fontSize: 14, color: COLORS.text3, textAlign: 'center', lineHeight: 22 },
  section: { padding: SPACING.md, paddingTop: SPACING.lg },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },
  emailCard: { backgroundColor: '#fff', borderWidth: 2, borderColor: COLORS.brandBorder, borderRadius: RADIUS.xl, padding: SPACING.lg, alignItems: 'center' },
  emailIcon: { fontSize: 36, marginBottom: SPACING.sm },
  emailTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.xs },
  emailDesc: { fontSize: 14, color: COLORS.text2, textAlign: 'center', lineHeight: 22, marginBottom: SPACING.md },
  emailAddr: { fontSize: 14, color: COLORS.brand, fontWeight: '700', fontFamily: 'Courier New', marginBottom: SPACING.md, backgroundColor: COLORS.brandBg, paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: RADIUS.full },
  emailBtn: { backgroundColor: COLORS.brand, paddingVertical: 14, paddingHorizontal: 28, borderRadius: RADIUS.lg, width: '100%', alignItems: 'center' },
  emailBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  linkCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm },
  linkLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, flex: 1 },
  linkIcon: { fontSize: 24 },
  linkTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  linkSub: { fontSize: 12, color: COLORS.text3, marginTop: 2 },
  linkArrow: { fontSize: 22, color: COLORS.brand, fontWeight: '700' },
  faqItem: { backgroundColor: '#fff', borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm },
  faqQ: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: 6 },
  faqA: { fontSize: 13, color: COLORS.text2, lineHeight: 20 },
  aboutCard: { backgroundColor: '#fff', borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.xl, padding: SPACING.lg, alignItems: 'center' },
  avatarBox: { width: 72, height: 72, borderRadius: 36, backgroundColor: COLORS.brand, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.md },
  avatarText: { color: '#fff', fontSize: 28, fontWeight: '800' },
  aboutName: { fontSize: 20, fontWeight: '800', color: COLORS.text, marginBottom: 4 },
  aboutRole: { fontSize: 13, color: COLORS.brand, fontWeight: '600', marginBottom: SPACING.md },
  aboutBio: { fontSize: 14, color: COLORS.text2, textAlign: 'center', lineHeight: 22, marginBottom: SPACING.md },
  ghBtn: { backgroundColor: COLORS.brandBg, borderWidth: 1, borderColor: COLORS.brandBorder, borderRadius: RADIUS.full, paddingHorizontal: SPACING.lg, paddingVertical: 8 },
  ghBtnText: { color: COLORS.brand, fontWeight: '700', fontSize: 13 },
  footer: { padding: SPACING.lg, alignItems: 'center', gap: 4 },
  footerText: { fontSize: 12, color: COLORS.text3 },
});
