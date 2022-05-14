import { GithubUser } from "./GithubUser.js";

export class Favorites {
    constructor(root) {
        this.root = document.querySelector(root)

        this.load()
    }

    load() {
        this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || []
    }

    save() {
        localStorage.setItem('@github-favorites:', JSON.stringify(this.entries))
    }

    async add(username) {
        try {
            const userExists = this.entries.find(entry => entry.login === username)
            
            if (userExists) {
                throw new Error('Usuário já cadastrado')
            }

            const user = await GithubUser.search(username)

            if (user.login === undefined) {
                throw new Error('Usuário não encontrado')
            }

            this.entries = [user, ...this.entries]
            this.update()
            this.save()


        } catch (error) {
            alert(error.message)
        }
    }

    delete(user) {
        const withFavorites = document.querySelector('#with-favorites')
        const noFavorites = document.querySelector('#no-favorites')

        this.entries = this.entries
            .filter(entry => entry.login !== user.login)

            if(this.entries.length == 0) {
                withFavorites.classList.add('sr-only')
                noFavorites.classList.remove('sr-only')
                this.update()
            }

        this.update()
        this.save()
    }
}

export class FavoritesView extends Favorites {
    constructor(root) {
        super(root)

        this.tbody = this.root.querySelector('table tbody')

        this.update()
        this.onAdd()
    }

    onAdd() {
       const addButton = this.root.querySelector('.search button')

       addButton.onclick = () => {
           const { value } = this.root.querySelector('.search input')
           
           this.add(value)
        }
    }

    update() {
        this.removeAllTr()

        this.entries.forEach(user => {
            const row = this.createRow()

            row.querySelector('.user img').src = `https://github.com/${user.login}.png`
            row.querySelector('.user img').alt = `Imagem do perfil de usuário de ${user.name}`
            row.querySelector('.user a').href = `https://github.com/${user.login}`
            row.querySelector('.user p').textContent = user.name
            row.querySelector('.user span').textContent = `/${user.login}`
            row.querySelector('.repositories').textContent = user.public_repos
            row.querySelector('.followers').textContent = user.followers

            row.querySelector('.remove').onclick = () => {
                const isOk = confirm('Tem certeza que deseja remover essa linha?')

                if (isOk) {
                    this.delete(user)
                }
            }

            this.tbody.append(row)
            const withFavorites = document.querySelector('#with-favorites')
            const noFavorites = document.querySelector('#no-favorites')
            
            if ((this.entries.length) !== 0) {
                withFavorites.classList.remove('sr-only')
                noFavorites.classList.add('sr-only')                
            }  
        })
    }

    createRow() {
        const tr = document.createElement('tr')

        tr.innerHTML = `
            <td class="user">
                <img src="https://github.com/VictorCBB.png" alt="Imagem do perfil de usuário de Victor Barros">
                <a href="https://github.com/VictorCBB" target="_blank">
                <p>Victor Barros</p>
                <span>/VictorCBB</span>
                </a>
            </td>
            <td class="repositories">10</td>
            <td class="followers">17</td>
            <td>
                <button class="remove">
                Remover
                </button>
            </td>
        `

        return tr
    }

    removeAllTr() {
        this.tbody.querySelectorAll('tr')
            .forEach((tr) => {
                tr.remove()
            })
    }
}
