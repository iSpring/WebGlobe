import styles from './index.scss';
import loadingIcon from './loading.png';

const loadingDom = document.createElement("div");
loadingDom.id = styles.loading;
loadingDom.innerHTML = `<div class="${styles.content}"><div class="${styles.icon}" style="background-image:url(${loadingIcon})"></div><div class="${styles.text}">加载中...</div></div>`;
// const iconDom = document.createElement("div");
// iconDom.className = styles.icon;
// iconDom.style.backgroundImage = `url(${loadingIcon})`;
// loadingDom.appendChild(iconDom);

const loading = {
    show(){
        this.hide();
        document.body.appendChild(loadingDom);
    },

    hide(){
        if(loadingDom.parentNode){
            loadingDom.parentNode.removeChild(loadingDom);
        }
    }
};

export default loading;