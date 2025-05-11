import { TestBed } from '@angular/core/testing';

import { MonitoringService } from './monitoring.service';

describe('MonitoringServiceService', () => {
  let service: MonitoringService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MonitoringService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
