// IIFE - Immediately Invoked Function Expression - coloca todas as variáveis dentro do scope local
(() => {
    // Criando o Enum para poder listar todas as maneiras de notificar o usuário
    enum NotificationPlatform {
        SMS = 'SMS',
        EMAIL = 'EMAIL',
        PUSH_NOTIFICATION = 'PUSH_NOTIFICATION',
    }

    // Identificar qual o tipo de task estamos criando
    enum ViewMode {
        TODO = 'TODO',
        REMINDER = 'REMINDER',
    }

    // Criando função que gera um ID único para o reminder e o todo
    const UUID = (): string => {
        return Math.random().toString(32).substr(2, 9);
    };

    // Função para retornar uma data entendível
    const DateUtils = {
        tomorrow(): Date {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            return tomorrow;
        },
        today(): Date {
            return new Date();
        },
        // Função para formatar a data
        formatDate(date: Date): string {
            return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
        }
    };

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
        id: string = UUID(); // recebe nulo, por enquanto
        dateCreated: Date = DateUtils.today();
        dateUpdated: Date = DateUtils.today();
        description: string = '';

        // Coisas específicas para o reminder (e não para o todo)
        date: Date = DateUtils.tomorrow();
        notifications: Array<NotificationPlatform> = [NotificationPlatform.EMAIL] 
        // onde o usuário vai receber a notificação
        // por padrão, o local de notificação está EMAIL

        // Construtor para poder customizar o reminder
        constructor(
            description: string,
            date: Date,
            notifications: Array<NotificationPlatform>
        ) {
            this.description = description;
            this.date = date;
            this.notifications = notifications;

        }

        render(): string {
            // Retornando uma string template
            return `
            ---> Reminder <---
            Description: ${this.description}
            Date: ${DateUtils.formatDate(this.date)}
            Notification: ${this.notifications.join(',')}
            `;
        }
        // nesse caso o método render() além de definido, está implementado
        // O método render() irá servir para definir como o reminder e o todo devem aparecer na tela
        
    }

    // classe TODO
    class Todo implements Task {
        id: string = UUID();
        dateCreated: Date = DateUtils.today();
        dateUpdated: Date = DateUtils.today();
        description: string = '';

        done: boolean = false;

        constructor(description: string) {
            this.description = description;
        }

        render(): string {
            return `
            ---> TODO <---
            Description: ${this.description}
            Done: ${this.done}
            `;
        }

    }



    // constante que recebe objeto
    const todo = new Todo('Todo criado com a classe');

    const reminder = new Reminder('Reminder criado com a classe', new Date(), [NotificationPlatform.EMAIL]);

    // view - ponto em que o código se comunica com a interface - renderizar os todos e reminders
    const taskView = {
        // Receber o elemento do formulário e retornar um TODO ou um REMINDER
        
        getTodo(form: HTMLFormElement): Todo {

            // constante que recebe o valor digitado
            const todoDescription = form.todoDescription.value;
            // resetando o formulário
            form.reset();
            // criar o todo com o 'new todo' passando a descrição
            return new Todo(todoDescription); 
        },

        // Recebe um formulário e retorna um reminder
        getReminder(form: HTMLFormElement): Reminder {
            const reminderNotifications = [
                    form.notifications.value as NotificationPlatform,
            ];
            const reminderDate = new Date(form.reminderDate.value);
            const reminderDescription = form.reminderDescription.value;
            form.reset();
            return new Reminder(
                reminderDescription,
                reminderDate,
                reminderNotifications
            );
        },

        // lista com as anotações salvas
        render(tasks: Array<Task>, mode: ViewMode) {

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

            // Código que faz a troca do modo // inputs do formulário de TODO e REMINDER
            const todoSet = document.getElementById('todoSet');
            const reminderSet = document.getElementById('reminderSet');

            // Validando o modo 'ViewMode'
            if (mode === ViewMode.TODO) {
                todoSet?.setAttribute('style', 'display: block');
                todoSet?.removeAttribute('disabled');
                reminderSet?.setAttribute('style', 'display: none');
                reminderSet?.setAttribute('disabled', 'true');
            } else {
                reminderSet?.setAttribute('style', 'display: block');
                reminderSet?.removeAttribute('disabled');
                todoSet?.setAttribute('style', 'display: none');
                todoSet?.setAttribute('disabled', 'true');  
            }

        },
    };

    // Controller que mantem os todos e reminders em memória
    const TaskController = (view: typeof taskView) => { // Garantir quando a nossa View deve renderizar e armazenar em memória dentro do navegador as tasks
        const tasks: Array<Task> = []; // como o controller vai manter a lista em memória

        // Identificar qual o tipo de task estamos criando
        let mode: ViewMode = ViewMode.TODO;

        const handleEvent = (event: Event) => {
            event.preventDefault(); // Prevenindo o evento Default
            const form = event.target as HTMLFormElement;
            switch (mode as ViewMode) {
                case ViewMode.TODO:
                    tasks.push(view.getTodo(form));
                    break;
                case ViewMode.REMINDER:
                    tasks.push(view.getReminder(form));
                    break;
            }
            view.render(tasks, mode);
        };

        // Alterar o modo entre TODO e REMINDER quando apertar no Toggle
        const handleToggleMode = () => {
            switch (mode as ViewMode) {
                case ViewMode.TODO:
                    mode = ViewMode.REMINDER
                    break;
            
                case ViewMode.REMINDER:
                    mode = ViewMode.TODO
                    break
            }
            view.render(tasks, mode)
        }


        // Declarando o 'event listener' para o botão de 'Toggle Mode'
        // para conseguir trocar o formulário e passar para ele a função 'handleToggleMode'
        document
            .getElementById('toggleMode')
            ?.addEventListener('click', handleToggleMode);

        document
        .getElementById('taskForm')
        ?.addEventListener('submit', handleEvent);
    };

    TaskController(taskView);

})();