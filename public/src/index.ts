// IIFE - Immediately Invoked Function Expression - coloca todas as variáveis dentro do scope local
(() => {
    interface Task{// Definindo a interface
        id: string; // nome da anotação
        dateCreated: Date; // dia em que foi criado
        dateUpdated: Date; // dia em que foi atualizado
        description: string;
        render(): string; // não está implementando o método, apenas definindo quem deve existir quando uma classe implemenar
        // ou seja, quando o reminder ou todo implementarem a interface de tasks, ele será obrigado a fazer a implementação do método
        // chamado render()
    }

    // todo e reminder serão classes que implementarão a interface
    // classe REMINDER
    class Reminder implements Task {
        id: string = ''; // recebe nulo, por enquanto
        dateCreated: Date = new Date();
        dateUpdated: Date = new Date();
        description: string = '';

        // Coisas específicas para o reminder (e não para o todo)
        date: Date = new Date();
        notifications: Array<string> = ['EMAIL'] 
        // onde o usuário vai receber a notificação
        // por padrão, o local de notificação está EMAIL

        // Construtor para poder customizar o reminder
        constructor(
            description: string,
            date: Date,
            notifications: Array<string>
        ) {
            this.description = description;
            this.date = date;
            this.notifications = notifications;

        }

        render(): string {
            return JSON.stringify(this);
            // this é a referencia da classe -> a instancia do objeto que foi criado
        }
        // nesse caso o método render() além de definido, está implementado
        // O método render() irá servir para definir como o reminder e o todo devem aparecer na tela
        
    }

    // classe TODO
    class Todo implements Task {
        id: string = '';
        dateCreated: Date = new Date();
        dateUpdated: Date = new Date();
        description: string = '';

        done: boolean = false;

        constructor(description: string) {
            this.description = description;
        }

        render(): string {
            return JSON.stringify(this);
        }

    }



    // constante que recebe objeto
    const todo = new Todo('Todo criado com a classe');

    const reminder = new Reminder('Reminder criado com a classe', new Date(), ['EMAIL']);

    // view - ponto em que o código se comunica com a interface - renderizar os todos e reminders
    const taskView = {
        // lista com as anotações salvas
        render(tasks: Array<Task>) {

            // processo de limpar a lista - evitar a duplicidade dos elementos
            const taskList = document.getElementById('taskList') // seletor que pega o elemento de lista, que tem o ID taskList

            // while para manter um looping esvaziando a lista
            while (taskList?.firstChild) { // Sempre que um elemento tem 1 filho, firstChild retorna esse filho

                taskList.removeChild(taskList.firstChild); // Esvaziando de um a um, removendo sempre o firstChild
            }
            
            tasks.forEach((task) => {
                const li = document.createElement('LI');
                const textNode = document.createTextNode(task.render());
                li.appendChild(textNode);
                taskList?.appendChild(li);
            });
        },
    };

    // Controller que mantem os todos e reminders em memória
    const TaskController = (view: typeof taskView) => { // Garantir quando a nossa View deve renderizar e armazenar em memória dentro do navegador as tasks
        const tasks: Array<Task> = [todo, reminder]; // como o controller vai manter a lista em memória

        const handleEvent = (event: Event) => {
            event.preventDefault(); // Prevenindo o evento Default
            view.render(tasks);
        };

        document
        .getElementById('taskForm')
        ?.addEventListener('submit', handleEvent);
    };

    TaskController(taskView);

})();