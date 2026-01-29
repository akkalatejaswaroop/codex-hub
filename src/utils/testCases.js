
export const normalizeOutput = (str) => {
    return (str || "").trim().replace(/\r\n/g, '\n').replace(/\s+$/g, '');
};

export const checkTestCase = (actual, expected) => {
    const cleanActual = normalizeOutput(actual);
    const cleanExpected = normalizeOutput(expected);

    return {
        passed: cleanActual === cleanExpected,
        actual: cleanActual,
        expected: cleanExpected
    };
};

export const calculateScore = (testResults) => {
    if (!testResults || testResults.length === 0) return 0;
    const passed = testResults.filter(r => r.passed).length;
    return Math.round((passed / testResults.length) * 100);
};
