import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { apiService } from '../services/api';
import { Employee } from '../model/types';

export default function Index() {
  const [employees, setEmployees] = useState<Employee[] | null>(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      const data = await apiService.get<Employee[]>('/employees');
      if (data) setEmployees(data);
    };

    fetchEmployees();
  }, []);

  return (
    <View>
      {employees ? (
        employees.map((employee) => (
          <Text key={employee.id}>{employee.employee_name}</Text>
        ))
      ) : (
        <Text>Loading...</Text>
      )}
    </View>
  );
}
