import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS } from '../theme';
import { CHAPTERS } from '../data/chapters';

function CodeBlock({ code, output, label }) {
  const [copied, setCopied] = useState(false);

  const highlight = (code) => {
    const lines = code.split('\n');
    return lines.map((line, li) => {
      const parts = [];
      let rem = line;

      // Comments
      const cmIdx = rem.indexOf('#');
      let comment = '';
      if (cmIdx >= 0) { comment = rem.slice(cmIdx); rem = rem.slice(0, cmIdx); }

      // Simple tokenizer for coloring
      const tokens = rem.split(/(\s+|"[^"]*"|[0-9]+(?:\.[0-9]+)?|\b(?:give|check if|otherwise if|otherwise|for each|while|until|repeat|try|catch|finally|throw|return|break|next|pick|when|assert|is not|is|and|or|not|yes|no|nothing|let|const)\b|\b(?:say|write|warn|len|range|type_of|text|number|abs|sqrt|floor|ceil|round|min|max|filter|map|reduce|sort|reverse|sum|avg|push|join|split|upper|lower|trim|contains|has|keys|values|parse_json|stringify_json)\b|[+\-*\/\%\(\)\[\]\{\}:,<>=!\.]+)/);

      return (
        <Text key={li} style={{ fontFamily: 'Courier New', fontSize: 13, lineHeight: 22 }}>
          {tokens.map((tok, ti) => {
            if (!tok) return null;
            if (/^"[^"]*"$/.test(tok)) return <Text key={ti} style={{ color: COLORS.codeStr }}>{tok}</Text>;
            if (/^\d+(\.\d+)?$/.test(tok)) return <Text key={ti} style={{ color: COLORS.codeNum }}>{tok}</Text>;
            if (/^(give|check if|otherwise if|otherwise|for each|while|until|repeat|try|catch|finally|throw|return|break|next|pick|when|assert|is not|is|and|or|not)$/.test(tok)) return <Text key={ti} style={{ color: COLORS.codeKw, fontWeight: '700' }}>{tok}</Text>;
            if (/^(yes|no|nothing)$/.test(tok)) return <Text key={ti} style={{ color: COLORS.codeNum }}>{tok}</Text>;
            if (/^(say|write|warn|len|range|type_of|text|number|abs|sqrt|floor|ceil|round|min|max|filter|map|reduce|sort|reverse|sum|avg|push|join|split|upper|lower|trim|contains|has|keys|values|parse_json|stringify_json)$/.test(tok)) return <Text key={ti} style={{ color: COLORS.codeFn }}>{tok}</Text>;
            if (/^[-+*\/%<>=!]+$/.test(tok)) return <Text key={ti} style={{ color: COLORS.codeOp }}>{tok}</Text>;
            return <Text key={ti} style={{ color: COLORS.codeText }}>{tok}</Text>;
          })}
          {comment ? <Text style={{ color: COLORS.codeCm }}>{comment}</Text> : null}
          {'\n'}
        </Text>
      );
    });
  };

  return (
    <View style={styles.codeCard}>
      {label && <Text style={styles.codeLabel}>{label}</Text>}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.codeBody}>
          {highlight(code)}
        </View>
      </ScrollView>
      {output && (
        <View style={styles.outputBox}>
          <Text style={styles.outputLabel}>Output:</Text>
          <Text style={styles.outputText}>{output}</Text>
        </View>
      )}
    </View>
  );
}

export default function ChapterScreen({ route, navigation }) {
  const { chapterId } = route.params;
  const chapter = CHAPTERS.find(c => c.id === chapterId);
  const prevCh = CHAPTERS.find(c => c.id === chapterId - 1);
  const nextCh = CHAPTERS.find(c => c.id === chapterId + 1);

  if (!chapter) return <View style={styles.container}><Text>Chapter not found</Text></View>;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.chapterNum}>Chapter {chapter.id} of {CHAPTERS.length}</Text>
        <Text style={styles.icon}>{chapter.icon}</Text>
        <Text style={styles.title}>{chapter.title}</Text>
        <Text style={styles.subtitle}>{chapter.subtitle}</Text>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${(chapterId / CHAPTERS.length) * 100}%` }]} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {chapter.sections.map((sec, i) => {
          if (sec.type === 'text') return (
            <Text key={i} style={styles.bodyText}>{sec.content}</Text>
          );
          if (sec.type === 'code') return (
            <CodeBlock key={i} code={sec.code} output={sec.output} label={sec.label} />
          );
          if (sec.type === 'tip') return (
            <View key={i} style={styles.tipBox}>
              <Text style={styles.tipIcon}>💡</Text>
              <Text style={styles.tipText}>{sec.content}</Text>
            </View>
          );
          return null;
        })}
      </View>

      {/* Navigation */}
      <View style={styles.navRow}>
        {prevCh ? (
          <TouchableOpacity style={styles.navBtn} onPress={() => navigation.replace('Chapter', { chapterId: prevCh.id })}>
            <Text style={styles.navBtnText}>← {prevCh.title}</Text>
          </TouchableOpacity>
        ) : <View style={{ flex: 1 }} />}
        {nextCh ? (
          <TouchableOpacity style={[styles.navBtn, styles.navBtnRight]} onPress={() => navigation.replace('Chapter', { chapterId: nextCh.id })}>
            <Text style={[styles.navBtnText, { color: COLORS.brand }]}>{nextCh.title} →</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.navBtn, styles.navBtnRight]} onPress={() => navigation.navigate('Home')}>
            <Text style={[styles.navBtnText, { color: COLORS.green }]}>🎉 Completed!</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={{ height: SPACING.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { backgroundColor: COLORS.brandBg, borderBottomWidth: 1, borderBottomColor: COLORS.brandBorder, padding: SPACING.lg, alignItems: 'center' },
  chapterNum: { fontSize: 12, color: COLORS.brand, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: SPACING.xs },
  icon: { fontSize: 40, marginBottom: SPACING.sm },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.text, textAlign: 'center', marginBottom: SPACING.xs },
  subtitle: { fontSize: 14, color: COLORS.text3, textAlign: 'center' },
  progressBar: { height: 4, backgroundColor: COLORS.border },
  progressFill: { height: 4, backgroundColor: COLORS.brand },
  content: { padding: SPACING.md, paddingTop: SPACING.lg },
  bodyText: { fontSize: 15, color: COLORS.text2, lineHeight: 24, marginBottom: SPACING.md },
  codeCard: { backgroundColor: COLORS.bgCode, borderRadius: RADIUS.lg, marginBottom: SPACING.md, overflow: 'hidden' },
  codeLabel: { fontSize: 11, color: '#8b949e', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, padding: SPACING.sm, paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: '#21262d' },
  codeBody: { padding: SPACING.md },
  outputBox: { borderTopWidth: 1, borderTopColor: '#21262d', padding: SPACING.sm, backgroundColor: '#0a0f17' },
  outputLabel: { fontSize: 10, color: '#8b949e', fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 },
  outputText: { fontFamily: 'Courier New', fontSize: 13, color: '#85e89d', lineHeight: 20 },
  tipBox: { flexDirection: 'row', backgroundColor: COLORS.brandBg, borderLeftWidth: 3, borderLeftColor: COLORS.brand, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.md, gap: SPACING.sm, alignItems: 'flex-start' },
  tipIcon: { fontSize: 18 },
  tipText: { flex: 1, fontSize: 14, color: COLORS.text2, lineHeight: 22 },
  navRow: { flexDirection: 'row', gap: SPACING.sm, padding: SPACING.md },
  navBtn: { flex: 1, backgroundColor: COLORS.bgAlt, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg, padding: SPACING.md, alignItems: 'center' },
  navBtnRight: { borderColor: COLORS.brandBorder },
  navBtnText: { fontSize: 13, fontWeight: '600', color: COLORS.text2 },
});
