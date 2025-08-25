import React from "react";
import { BACKEND_BASE_URL } from "../../config/api";

class Register extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
           email: '',
           password: '',
           name: '',
           error: '',
           isSubmitting: false
        }
    }

    onNameChange = (event) => {
        this.setState({ name: event.target.value });
    }

    onEmailChange = (event) => {
        this.setState({ email: event.target.value });
    }

    onPasswordChange = (event) => {
        this.setState({ password: event.target.value });
    }

    onSubmitRegister = async () => {
        const { name, email, password } = this.state;
        const trimmedName = (name || '').trim();
        const trimmedEmail = (email || '').trim().toLowerCase();
        const trimmedPassword = (password || '').trim();

        if (!trimmedName || !trimmedEmail || !trimmedPassword) {
            this.setState({ error: 'Compila tutti i campi' });
            return;
        }

        this.setState({ isSubmitting: true, error: '' });
        try {
            const response = await fetch('http://localhost:3000/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: trimmedName, email: trimmedEmail, password: trimmedPassword })
            });

            let data = null;
            try {
                data = await response.json();
            } catch (e) {
                data = null;
            }

            if (response.ok && data && (data.id || (data.user && data.user.id))) {
                const user = data.user ? data.user : data;
                if (this.props.loadUser) {
                    this.props.loadUser(user);
                }
                this.props.onRouteChange('home');
                return;
            }

            const errText = !response.ok ? (await response.text().catch(() => '')) : '';
            this.setState({
                error: errText || (data && (data.error || data.message)) || 'Registrazione non valida',
                isSubmitting: false
            });
        } catch (error) {
            this.setState({ error: 'Errore di rete. Riprova.', isSubmitting: false });
        }
    }

    render() {
        const { onRouteChange } = this.props;
    return (
        <article className="br3 ba dark-gray b--black-10 mv4 w-100 w-50-m w-25-l mw6 shadow-5 center">
        <main className="pa4 black-80">
            <form className="measure">
                <fieldset id="register" className="ba b--transparent ph0 mh0">
                    <legend className="f1 fw6 ph0 mh0">Register</legend>
                    <div className="mt3">
                        <label className="db fw6 lh-copy f6" htmlFor="name">Name</label>
                        <input 
                        className="pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100" 
                        type="text" 
                        name="name" 
                        id="name" 
                        onChange={this.onNameChange}
                        />
                    </div>
                    <div className="mt3">
                        <label className="db fw6 lh-copy f6" htmlFor="email-address">Email</label>
                        <input 
                        className="pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100" 
                        type="email" 
                        name="email-address" 
                        id="email-address" 
                        onChange={this.onEmailChange}
                        />
                    </div>
                    <div className="mv3">
                        <label className="db fw6 lh-copy f6" htmlFor="password">Password</label>
                        <input
                         className="b pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100" 
                         type="password" 
                         name="password" 
                         id="password" 
                         onChange={this.onPasswordChange}
                         />
                    </div>
                </fieldset>
                <div className="">
                    <button 
                    type="button"
                    onClick={this.onSubmitRegister}
                    disabled={this.state.isSubmitting}
                    className="b ph3 pv2 input-reset ba b--black bg-transparent grow pointer f6 dib">
                        Register
                    </button>
                </div>
                {this.state.error && (
                    <div className="dark-red mt3">
                        {this.state.error}
                    </div>
                )}
                <div className="lh-copy mt3">
                    <p onClick={() => onRouteChange('signin')} className="f6 link dim black db">Back to Sign in</p>
                </div>
            </form>
        </main>
        </article>
    )
}
}
export default Register;