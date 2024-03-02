import { Component } from '../component';
import * as desec from '@pulumi/desec';
import * as servers from './servers';
import { NzbrLinkComponent } from './nzbr-link';
import { NzbrDeComponent } from './nzbr-de';

export class DesecComponent extends Component {
    constructor() {
        super(null, 'desec');

        new NzbrDeComponent(this);
        new NzbrLinkComponent(this);
    }
}
