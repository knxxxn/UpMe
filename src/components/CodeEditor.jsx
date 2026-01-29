import { useState, useRef } from 'react'
import Editor from '@monaco-editor/react'
import './CodeEditor.css'

const languageTemplates = {
    python: `def solution(n):
    # 코드를 작성해주세요
    answer = 0
    return answer`,
    javascript: `function solution(n) {
    // 코드를 작성해주세요
    var answer = 0;
    return answer;
}`,
    java: `class Solution {
    public int solution(int n) {
        // 코드를 작성해주세요
        int answer = 0;
        return answer;
    }
}`,
    cpp: `#include <string>
#include <vector>

using namespace std;

int solution(int n) {
    // 코드를 작성해주세요
    int answer = 0;
    return answer;
}`
}

const languageOptions = [
    { value: 'python', label: 'Python3' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' }
]

function CodeEditor({ onCodeChange, onLanguageChange }) {
    const [language, setLanguage] = useState('python')
    const [code, setCode] = useState(languageTemplates.python)
    const editorRef = useRef(null)

    const handleLanguageChange = (e) => {
        const newLanguage = e.target.value
        setLanguage(newLanguage)
        setCode(languageTemplates[newLanguage])
        onLanguageChange?.(newLanguage)
    }

    const handleEditorChange = (value) => {
        setCode(value)
        onCodeChange?.(value)
    }

    const handleEditorMount = (editor) => {
        editorRef.current = editor
        editor.focus()
    }

    const handleReset = () => {
        setCode(languageTemplates[language])
        onCodeChange?.(languageTemplates[language])
    }

    return (
        <div className="code-editor-container">
            <div className="editor-toolbar">
                <div className="toolbar-left">
                    <select
                        value={language}
                        onChange={handleLanguageChange}
                        className="language-select"
                    >
                        {languageOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="toolbar-right">
                    <button className="toolbar-btn" onClick={handleReset}>
                        🔄 초기화
                    </button>
                </div>
            </div>

            <div className="editor-wrapper">
                <Editor
                    height="100%"
                    language={language === 'cpp' ? 'cpp' : language}
                    value={code}
                    onChange={handleEditorChange}
                    onMount={handleEditorMount}
                    theme="vs-dark"
                    options={{
                        fontSize: 14,
                        fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        padding: { top: 16 },
                        lineNumbers: 'on',
                        renderLineHighlight: 'all',
                        automaticLayout: true,
                        tabSize: 4,
                        wordWrap: 'on',
                        cursorBlinking: 'smooth',
                        cursorSmoothCaretAnimation: 'on',
                        smoothScrolling: true,
                        bracketPairColorization: { enabled: true },
                    }}
                />
            </div>
        </div>
    )
}

export default CodeEditor
