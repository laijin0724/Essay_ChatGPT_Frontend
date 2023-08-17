module.exports = {
    content: [
        "./src/pages/**/*.{js,jsx}",
        "./src/components/**/*.{js,jsx}",
        "./src/section/*.{js,jsx}"
    ],
    theme: {
        screens: {
            sm: '480px',
            md: '768px',
            lg: '976px',
            xl: '1440px',
        },
        colors: {
            'upgradeBtn': '#4FB5FF',
            'upgradeBtn-hover': '#0571cf',
            'pink': '#ff49db',
            'orange': '#ff7849',
            'green': '#13ce66',
            'gray-dark': '#dedede',
            'gray': '#efefef',
            'gray-light': '#f7fbff',
            'white': '#fff',
            'blue' : {
                700 : '#114ce3',
                600 : '#255ae1',
            },
            'orange' : {
                700 : '#e5980b',
                600 : '#e7a224',
            },
            'information-subtitle-background' : '#DEDEDE',
            'blur-pink': '#636aeb',
            'essayHint': '#7A7A7A',
            'essayModalText': '#828282'
        },
        fontFamily: {
            sans: ['Graphik', 'sans-serif'],
            serif: ['Merriweather', 'serif'],
        },
        extend: {
            spacing: {
                '128': '32rem',
                '144': '36rem',
            },
            borderRadius: {
                'lg': '10px',
                'information-section': '4px',
                'information-subtitle': '4px'
            }, 
            borderColor: {
                'gray' : '#c3b7b7',
                'black' : '#000'
                // 'gray' : '#6a6464'
            }
        }
    },
    plugins: [],
}