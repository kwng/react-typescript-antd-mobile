module.exports = {
    presets: [require.resolve("@babel/preset-env"), require.resolve("@babel/preset-react")],
    plugins: [
        require.resolve("@babel/plugin-syntax-dynamic-import"),
        [require.resolve("@babel/plugin-proposal-decorators"), { "legacy": true }],
        require.resolve("@babel/plugin-proposal-class-properties"),
        require.resolve("@babel/plugin-proposal-optional-chaining"),
        ['import', { libraryName: 'antd-mobile', style: 'true' }]
    ]
}
