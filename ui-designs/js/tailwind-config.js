tailwind.config = {
    theme: {
        extend: {
            colors: {
                primary: '#FF6B8B', // 元气粉
                secondary: '#4A90E2', // 科技蓝
                dark: '#121212',
                light: '#F5F5F5',
                glass: 'rgba(255, 255, 255, 0.15)',
                background: '#0F0F0F', // 背景色
                textPrimary: '#FFFFFF', // 主要文本
                textSecondary: '#CCCCCC', // 次要文本
                textTertiary: '#888888', //  tertiary文本
            },
            fontFamily: {
                inter: ['Inter', 'sans-serif'],
                sans: ['PingFang SC', 'HarmonyOS Sans SC', 'sans-serif']
            },
            boxShadow: {
                'glow': '0 0 30px rgba(255, 107, 139, 0.5)',
                'glow-blue': '0 0 30px rgba(74, 144, 226, 0.5)'
            },
            animation: {
                'float': 'float 3s ease-in-out infinite',
                'bounce-slow': 'bounce 3s infinite',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'heartbeat': 'heartbeat 0.8s ease-in-out infinite',
                'celebrate': 'celebrate 2s ease-out',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-15px)' },
                },
                heartbeat: {
                    '0%, 100%': { transform: 'scale(1)' },
                    '40%': { transform: 'scale(1.03)' },
                    '50%': { transform: 'scale(1)' },
                    '60%': { transform: 'scale(1.03)' },
                },
                celebrate: {
                    '0%': { transform: 'scale(0.8)', opacity: 0 },
                    '50%': { transform: 'scale(1.2)', opacity: 1 },
                    '100%': { transform: 'scale(1)', opacity: 1 },
                }
            }
        }
    }
}