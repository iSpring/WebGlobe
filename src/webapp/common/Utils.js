export const handleStyles = (styles) => {
    if(styles && styles.locals){
        for(let localName in styles.locals){
            if(styles.locals.hasOwnProperty(localName)){
                styles[localName] = styles.locals[localName];
            }
        }
    }
};