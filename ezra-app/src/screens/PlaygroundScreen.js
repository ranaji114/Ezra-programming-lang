import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, KeyboardAvoidingView, Platform, Dimensions,
} from 'react-native';
import { COLORS, SPACING, RADIUS } from '../theme';
import { runEzra } from '../interpreter';

const EXAMPLES = {
  'Hello World': 'say "Hello, World!"',
  'Variables':   'name is "Ankur"\nage is 25\nsay "Hello {name}, age {age}!"',
  'Conditions':  'score is 85\ncheck if score >= 90\n  say "Grade A"\notherwise if score >= 75\n  say "Grade B"\notherwise\n  say "Try again"',
  'Loop':        'i is 1\nwhile i <= 5\n  say "Count: {i}"\n  i += 1',
  'Function':    'give add(a, b)\n  -> a + b\n\nsay add(10, 20)\nsay add(3, 7)',
  'Lists':       'nums is [1,2,3,4,5]\nsay nums.filter(n -> n % 2 is 0)\nsay nums.map(n -> n * 2)\nsay nums.sum()',
  'FizzBuzz':    'i is 1\nwhile i <= 15\n  check if i % 15 is 0\n    say "FizzBuzz"\n  otherwise if i % 3 is 0\n    say "Fizz"\n  otherwise if i % 5 is 0\n    say "Buzz"\n  otherwise\n    say i\n  i += 1',
  'Fibonacci':   'give fib(n)\n  check if n <= 1\n    -> n\n  -> fib(n-1) + fib(n-2)\n\ni is 0\nwhile i <= 9\n  say "fib({i}) = {fib(i)}"\n  i += 1',
  'Error':       'try\n  x is 10 / 0\ncatch err\n  say "Caught: {err}"\nfinally\n  say "Done"',
  'Object':      'user is { name: "Ezra", version: 1 }\nsay user.name\nsay user.keys()\nsay stringify_json(user)',
};

const LINE_HEIGHT = 20;

export default function PlaygroundScreen() {
  const [code, setCode] = useState(EXAMPLES['Hello World']);
  const [output, setOutput] = useState([]);
  const [running, setRunning] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  const outputRef = useRef(null);

  const run = () => {
    setRunning(true);
    setOutput([]);
    setTimeout(() => {
      try {
        const result = runEzra(code);
        setOutput(result.length ? result : [{ t: 'info', v: '(no output)' }]);
      } catch (e) {
        setOutput([{ t: 'err', v: 'error: ' + (e.message || String(e)) }]);
      }
      setRunning(false);
    }, 10);
  };

  const lineCount = code.split('\n').length;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Toolbar */}
      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.examplesBtn} onPress={() => setShowExamples(!showExamples)}>
          <Text style={styles.examplesBtnText}>Examples ▾</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <TouchableOpacity style={styles.clearBtn} onPress={() => setOutput([])}>
          <Text style={styles.clearBtnText}>Clear</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.runBtn, running && { opacity: 0.6 }]} onPress={run} disabled={running}>
          <Text style={styles.runBtnText}>{running ? '⏳' : '▶ Run'}</Text>
        </TouchableOpacity>
      </View>

      {/* Examples dropdown */}
      {showExamples && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.examplesRow}>
          {Object.keys(EXAMPLES).map(name => (
            <TouchableOpacity
              key={name}
              style={styles.exampleChip}
              onPress={() => { setCode(EXAMPLES[name]); setOutput([]); setShowExamples(false); }}
            >
              <Text style={styles.exampleChipText}>{name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Editor */}
      <View style={styles.editorContainer}>
        <View style={styles.lineNums}>
          {Array.from({ length: lineCount }, (_, i) => (
            <Text key={i} style={styles.lineNum}>{i + 1}</Text>
          ))}
        </View>
        <TextInput
          style={styles.editor}
          value={code}
          onChangeText={setCode}
          multiline
          autoCorrect={false}
          autoCapitalize="none"
          spellCheck={false}
          scrollEnabled={false}
          textAlignVertical="top"
          fontFamily="Courier New"
        />
      </View>

      {/* Output */}
      <View style={styles.outputContainer}>
        <Text style={styles.outputHeader}>Output</Text>
        <ScrollView ref={outputRef} style={styles.outputScroll} onContentSizeChange={() => outputRef.current?.scrollToEnd()}>
          {output.length === 0
            ? <Text style={styles.outputEmpty}>Press ▶ Run to execute code</Text>
            : output.map((line, i) => (
              <Text key={i} style={[styles.outputLine,
                line.t === 'err'  ? { color: COLORS.red }    :
                line.t === 'warn' ? { color: '#ffa657' }     :
                line.t === 'info' ? { color: COLORS.codeCm } : { color: '#85e89d' }
              ]}>
                {line.t === 'err' ? '✗ ' : line.t === 'warn' ? '⚠ ' : '  '}{line.v}
              </Text>
            ))
          }
        </ScrollView>
      </View>

      {/* Hint */}
      <View style={styles.hintBar}>
        <Text style={styles.hintText}>💡 Tap Run to execute · Most Ezra features supported</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgCode },
  toolbar: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, backgroundColor: '#161b22', padding: SPACING.sm, borderBottomWidth: 1, borderBottomColor: '#30363d' },
  examplesBtn: { backgroundColor: '#21262d', borderWidth: 1, borderColor: '#30363d', borderRadius: RADIUS.sm, paddingHorizontal: 10, paddingVertical: 6 },
  examplesBtnText: { color: '#8b949e', fontSize: 13, fontWeight: '600' },
  clearBtn: { paddingHorizontal: 10, paddingVertical: 6 },
  clearBtnText: { color: '#8b949e', fontSize: 13 },
  runBtn: { backgroundColor: COLORS.brand, borderRadius: RADIUS.sm, paddingHorizontal: 16, paddingVertical: 7 },
  runBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  examplesRow: { backgroundColor: '#161b22', borderBottomWidth: 1, borderBottomColor: '#30363d', paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs, maxHeight: 44 },
  exampleChip: { backgroundColor: '#21262d', borderWidth: 1, borderColor: '#30363d', borderRadius: RADIUS.full, paddingHorizontal: 12, paddingVertical: 5, marginRight: SPACING.xs },
  exampleChipText: { color: '#c9d1d9', fontSize: 12, fontWeight: '500' },
  editorContainer: { flex: 2, flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#30363d' },
  lineNums: { backgroundColor: '#0d1117', paddingTop: SPACING.md, paddingHorizontal: SPACING.sm, minWidth: 36, alignItems: 'flex-end', borderRightWidth: 1, borderRightColor: '#21262d' },
  lineNum: { fontSize: 12, color: '#4a5568', fontFamily: 'Courier New', lineHeight: LINE_HEIGHT, textAlign: 'right' },
  editor: { flex: 1, backgroundColor: '#0d1117', color: '#e6edf3', fontFamily: 'Courier New', fontSize: 14, lineHeight: LINE_HEIGHT, padding: SPACING.md, paddingTop: SPACING.md },
  outputContainer: { flex: 1, backgroundColor: '#0a0f17', borderTopWidth: 1, borderTopColor: '#30363d' },
  outputHeader: { fontSize: 11, color: '#8b949e', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, padding: SPACING.sm, borderBottomWidth: 1, borderBottomColor: '#21262d' },
  outputScroll: { flex: 1, padding: SPACING.sm },
  outputEmpty: { color: '#4a5568', fontFamily: 'Courier New', fontSize: 13, padding: SPACING.xs },
  outputLine: { fontFamily: 'Courier New', fontSize: 13, lineHeight: 20, paddingVertical: 1 },
  hintBar: { backgroundColor: '#161b22', padding: 6, borderTopWidth: 1, borderTopColor: '#30363d', alignItems: 'center' },
  hintText: { fontSize: 11, color: '#8b949e' },
});
